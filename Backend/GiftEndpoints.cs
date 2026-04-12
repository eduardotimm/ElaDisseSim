using ElaDisseSim.Api.Database;
using Microsoft.EntityFrameworkCore;

namespace ElaDisseSim.Api.Features.Gifts;

public static class GiftEndpoints
{
    public static void MapGiftEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/gifts", async (AppDbContext db) =>
        {
            var gifts = await db.Gifts.ToListAsync();
            return Results.Ok(gifts);
        });

        app.MapPost("/api/gifts", async (CreateGiftRequest request, AppDbContext db) =>
        {
            var gift = new Gift
            {
                Title = request.Title,
                Description = request.Description,
                Price = request.Price,
                ImageUrl = request.ImageUrl,
                IsPurchased = false
            };

            db.Gifts.Add(gift);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Presente cadastrado com sucesso!", GiftId = gift.Id });
        });

        app.MapPut("/api/gifts/{id:int}", async (int id, UpdateGiftRequest request, AppDbContext db) =>
        {
            var gift = await db.Gifts.FindAsync(id);
            if (gift is null) return Results.NotFound(new { Message = "Presente não encontrado." });

            gift.Title = request.Title;
            gift.Description = request.Description;
            gift.Price = request.Price;
            gift.ImageUrl = request.ImageUrl;
            gift.IsPurchased = request.IsPurchased;
            gift.PurchasedBy = request.PurchasedBy;

            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Presente atualizado com sucesso!" });
        });

        app.MapPost("/api/gifts/{id:int}/purchase", async (int id, PurchaseGiftRequest request, AppDbContext db) =>
        {
            var gift = await db.Gifts.FindAsync(id);
            if (gift is null) return Results.NotFound(new { Message = "Presente não encontrado." });
            if (gift.IsPurchased) return Results.BadRequest(new { Message = "Este presente já foi comprado por outro convidado." });

            var family = await db.Families.FirstOrDefaultAsync(f => f.PhoneNumber == request.PhoneNumber);
            if (family is null) return Results.BadRequest("Telefone não encontrado na lista de convidados. Apenas convidados confirmados podem comprar presentes.");

            gift.IsPurchased = true;
            gift.PurchasedBy = family.Name; // Salva o nome da família no presente
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Presente comprado com sucesso!" });
        });

        app.MapDelete("/api/gifts/{id:int}", async (int id, AppDbContext db) =>
        {
            var gift = await db.Gifts.FindAsync(id);
            if (gift is null) return Results.NotFound(new { Message = "Presente não encontrado." });

            db.Gifts.Remove(gift);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Presente excluído com sucesso!" });
        });
    }
}

public record CreateGiftRequest(string Title, string Description, decimal Price, string? ImageUrl);
public record UpdateGiftRequest(string Title, string Description, decimal Price, string? ImageUrl, bool IsPurchased, string? PurchasedBy);
public record PurchaseGiftRequest(string PhoneNumber);