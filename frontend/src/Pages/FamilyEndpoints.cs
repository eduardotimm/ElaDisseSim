using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace ElaDisseSim.Api.Features.Rsvp;

public static class FamilyEndpoints
{
    public static void MapFamilyEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/families", async (CreateFamilyRequest request, AppDbContext db) =>
        {
            // Validação: 1 chefe + até 5 acompanhantes = máximo 6 pessoas
            if (request.Guests.Count > 6)
            {
                return Results.BadRequest("Um núcleo familiar pode ter no máximo 6 pessoas (1 chefe + 5 acompanhantes).");
            }

            var family = new Family
            {
                Name = request.FamilyName,
                PhoneNumber = request.PhoneNumber,
                Guests = request.Guests.Select(name => new Guest 
                { 
                    Name = name, 
                    IsConfirmed = false 
                }).ToList()
            };

            db.Families.Add(family);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Família cadastrada com sucesso!", FamilyId = family.Id });
        });
    }
}

public record CreateFamilyRequest(string FamilyName, string PhoneNumber, List<string> Guests);