using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
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
        }).RequireAuthorization();

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
            if (request.IsPurchased) gift.ReservedUntil = null; // Se marcado como comprado, limpa a reserva

            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Presente atualizado com sucesso!" });
        }).RequireAuthorization();

        app.MapPost("/api/gifts/{id:int}/purchase", async (int id, PurchaseGiftRequest request, AppDbContext db) =>
        {
            var gift = await db.Gifts.FindAsync(id);
            if (gift is null) return Results.NotFound(new { Message = "Presente não encontrado." });
            if (gift.IsPurchased) return Results.BadRequest(new { Message = "Este presente já foi comprado por outro convidado." });
            if (gift.ReservedUntil.HasValue && gift.ReservedUntil.Value > DateTime.UtcNow) return Results.BadRequest(new { Message = "Este presente já está reservado aguardando confirmação de pagamento." });

            var family = await db.Families.FirstOrDefaultAsync(f => f.PhoneNumber == request.PhoneNumber);
            if (family is null) return Results.BadRequest("Telefone não encontrado na lista de convidados. Apenas convidados confirmados podem comprar presentes.");

            gift.ReservedUntil = DateTime.UtcNow.AddHours(12);
            gift.PurchasedBy = family.Name;
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Presente reservado com sucesso!" });
        });

        app.MapPost("/api/gifts/{id:int}/confirm-reservation", async (int id, AppDbContext db) =>
        {
            var gift = await db.Gifts.FindAsync(id);
            if (gift is null) return Results.NotFound(new { Message = "Presente não encontrado." });
            gift.IsPurchased = true;
            gift.ReservedUntil = null;
            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Pagamento confirmado com sucesso!" });
        }).RequireAuthorization();

        app.MapPost("/api/gifts/{id:int}/cancel-reservation", async (int id, AppDbContext db) =>
        {
            var gift = await db.Gifts.FindAsync(id);
            if (gift is null) return Results.NotFound(new { Message = "Presente não encontrado." });
            gift.ReservedUntil = null;
            gift.PurchasedBy = null;
            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Reserva cancelada com sucesso!" });
        }).RequireAuthorization();

        app.MapDelete("/api/gifts/{id:int}", async (int id, AppDbContext db) =>
        {
            var gift = await db.Gifts.FindAsync(id);
            if (gift is null) return Results.NotFound(new { Message = "Presente não encontrado." });

            db.Gifts.Remove(gift);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Presente excluído com sucesso!" });
        }).RequireAuthorization();

        app.MapPost("/api/gifts/create-preference", async (CreatePreferenceRequest request, IConfiguration config) =>
        {
            var token = config["MercadoPago:AccessToken"];
            if (string.IsNullOrEmpty(token)) return Results.BadRequest("Token do Mercado Pago não configurado.");

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var payload = new
            {
                items = new[]
                {
                    new
                    {
                        title = request.Title,
                        description = request.Description ?? "Presente de Casamento",
                        quantity = 1,
                        currency_id = "BRL",
                        unit_price = request.Price
                    }
                },
                payment_methods = new
                {
                    excluded_payment_types = new[]
                    {
                        new { id = "ticket" }, // Boleto
                        new { id = "bank_transfer" }, // Pix
                        new { id = "atm" }, // Pagamento na lotérica
                        new { id = "debit_card" } // Cartão de débito
                    },
                    installments = 6, // Força a permitir até 6x no máximo
                    default_installments = request.Installments
                }
            };

            var response = await httpClient.PostAsJsonAsync("https://api.mercadopago.com/checkout/preferences", payload);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return Results.BadRequest($"Erro detalhado do Mercado Pago: {error}");
            }

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            return Results.Ok(new { init_point = result.GetProperty("init_point").GetString() });
        });
    }
}

public record CreateGiftRequest(string Title, string Description, decimal Price, string? ImageUrl);
public record UpdateGiftRequest(string Title, string Description, decimal Price, string? ImageUrl, bool IsPurchased, string? PurchasedBy);
public record PurchaseGiftRequest(string PhoneNumber);
public record CreatePreferenceRequest(string Title, string? Description, decimal Price, int Installments, string ReturnUrl);