using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ElaDisseSim.Api.Database;

namespace ElaDisseSim.Api.Features.Rsvp;

public static class FamilyEndpoints
{
    public static void MapFamilyEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/families", async (AppDbContext db) =>
        {
            var families = await db.Families
                .Select(f => new 
                {
                    Id = f.Id,
                    Name = f.Name,
                    PhoneNumber = f.PhoneNumber,
                    Guests = f.Guests.Select(g => new { Id = g.Id, Name = g.Name, IsConfirmed = g.IsConfirmed })
                })
                .ToListAsync();
            return Results.Ok(families);
        }).RequireAuthorization();

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
                Guests = request.Guests.Select(g => new Guest 
                { 
                    Name = g.Name, 
                    IsConfirmed = g.IsConfirmed 
                }).ToList()
            };

            db.Families.Add(family);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Família cadastrada com sucesso!", FamilyId = family.Id });
        }).RequireAuthorization();

        app.MapDelete("/api/families/{id:int}", async (int id, AppDbContext db) =>
        {
            var family = await db.Families.FindAsync(id);
            if (family is null)
            {
                return Results.NotFound(new { Message = "Família não encontrada." });
            }

            db.Families.Remove(family);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Família excluída com sucesso!" });
        }).RequireAuthorization();

        app.MapPut("/api/families/{id:int}", async (int id, UpdateFamilyRequest request, AppDbContext db) =>
        {
            if (request.Guests.Count > 6)
            {
                return Results.BadRequest("Um núcleo familiar pode ter no máximo 6 pessoas (1 chefe + 5 acompanhantes).");
            }

            var family = await db.Families.Include(f => f.Guests).FirstOrDefaultAsync(f => f.Id == id);
            if (family is null) return Results.NotFound(new { Message = "Família não encontrada." });

            family.Name = request.FamilyName;
            family.PhoneNumber = request.PhoneNumber;

            // Identifica os IDs dos convidados que vieram na requisição
            var requestGuestIds = request.Guests.Where(g => g.Id.HasValue).Select(g => g.Id.GetValueOrDefault()).ToList();
            
            // Remove os convidados que estavam no banco, mas foram apagados no frontend
            var guestsToRemove = family.Guests.Where(g => !requestGuestIds.Contains(g.Id)).ToList();
            foreach (var g in guestsToRemove) family.Guests.Remove(g);

            // Atualiza os convidados existentes ou insere novos
            foreach (var reqGuest in request.Guests)
            {
                if (reqGuest.Id.HasValue && reqGuest.Id.Value > 0)
                {
                    var existing = family.Guests.FirstOrDefault(g => g.Id == reqGuest.Id.Value);
                    if (existing != null) 
                    {
                        existing.Name = reqGuest.Name;
                        existing.IsConfirmed = reqGuest.IsConfirmed;
                    }
                }
                else family.Guests.Add(new Guest { Name = reqGuest.Name, IsConfirmed = reqGuest.IsConfirmed });
            }

            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Família atualizada com sucesso!" });
        }).RequireAuthorization();

        app.MapGet("/api/families/by-phone/{phoneNumber}", async (string phoneNumber, AppDbContext db) =>
        {
            var family = await db.Families
                .Include(f => f.Guests)
                .FirstOrDefaultAsync(f => f.PhoneNumber == phoneNumber);

            if (family is null) return Results.NotFound(new { Message = "Convite não encontrado." });

            return Results.Ok(new 
            {
                Id = family.Id,
                Name = family.Name,
                PhoneNumber = family.PhoneNumber,
                Guests = family.Guests.Select(g => new { Id = g.Id, Name = g.Name, IsConfirmed = g.IsConfirmed })
            });
        });

        app.MapPut("/api/families/{id:int}/rsvp", async (int id, RsvpUpdateRequest request, AppDbContext db) =>
        {
            var family = await db.Families.Include(f => f.Guests).FirstOrDefaultAsync(f => f.Id == id);
            if (family is null) return Results.NotFound(new { Message = "Família não encontrada." });

            foreach (var guestUpdate in request.Guests)
            {
                var guest = family.Guests.FirstOrDefault(g => g.Id == guestUpdate.Id);
                if (guest != null) guest.IsConfirmed = guestUpdate.IsConfirmed;
            }

            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Presença atualizada com sucesso!" });
        });

        app.MapPut("/api/families/confirm-all", async (AppDbContext db) =>
        {
            var allGuests = await db.Guests.ToListAsync();
            foreach (var guest in allGuests)
            {
                guest.IsConfirmed = true;
            }
            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Todos os convidados foram confirmados com sucesso!" });
        }).RequireAuthorization();
    }
}

public record CreateGuestRequest(string Name, bool? IsConfirmed);
public record CreateFamilyRequest(string FamilyName, string PhoneNumber, List<CreateGuestRequest> Guests);
public record UpdateGuestRequest(int? Id, string Name, bool? IsConfirmed);
public record UpdateFamilyRequest(string FamilyName, string PhoneNumber, List<UpdateGuestRequest> Guests);

public record RsvpUpdateRequest(List<UpdateGuestPresenceRequest> Guests);
public record UpdateGuestPresenceRequest(int Id, bool? IsConfirmed);