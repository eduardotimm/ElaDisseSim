using ElaDisseSim.Api.Database;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ElaDisseSim.Api.Features.Faqs;

public class Faq
{
    [Key]
    public int Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int Order { get; set; } = 0;
}

public static class FaqEndpoints
{
    public static void MapFaqEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/faqs", async (AppDbContext db) =>
        {
            var faqs = await db.Faqs.OrderBy(f => f.Order).ToListAsync();
            return Results.Ok(faqs);
        });

        app.MapPost("/api/faqs", async (CreateFaqRequest request, AppDbContext db) =>
        {
            var order = await db.Faqs.CountAsync(); // Joga para o último lugar da lista
            var faq = new Faq { Question = request.Question, Answer = request.Answer, Order = order };
            db.Faqs.Add(faq);
            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "FAQ cadastrada com sucesso!", FaqId = faq.Id });
        }).RequireAuthorization();

        app.MapPut("/api/faqs/{id:int}", async (int id, UpdateFaqRequest request, AppDbContext db) =>
        {
            var faq = await db.Faqs.FindAsync(id);
            if (faq is null) return Results.NotFound(new { Message = "FAQ não encontrada." });

            faq.Question = request.Question;
            faq.Answer = request.Answer;

            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "FAQ atualizada com sucesso!" });
        }).RequireAuthorization();

        app.MapDelete("/api/faqs/{id:int}", async (int id, AppDbContext db) =>
        {
            var faq = await db.Faqs.FindAsync(id);
            if (faq is null) return Results.NotFound(new { Message = "FAQ não encontrada." });

            db.Faqs.Remove(faq);
            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "FAQ excluída com sucesso!" });
        }).RequireAuthorization();

        app.MapPut("/api/faqs/reorder", async (int[] ids, AppDbContext db) =>
        {
            var faqs = await db.Faqs.ToListAsync();
            for (int i = 0; i < ids.Length; i++)
            {
                var faq = faqs.FirstOrDefault(f => f.Id == ids[i]);
                if (faq != null) faq.Order = i;
            }
            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Ordem atualizada!" });
        }).RequireAuthorization();
    }
}

public record CreateFaqRequest(string Question, string Answer);
public record UpdateFaqRequest(string Question, string Answer);