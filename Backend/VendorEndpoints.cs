using ElaDisseSim.Api.Database;
using Microsoft.EntityFrameworkCore;

namespace ElaDisseSim.Api.Features.Vendors;

public static class VendorEndpoints
{
    public static void MapVendorEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/vendors", async (AppDbContext db) =>
        {
            var vendors = await db.Vendors.ToListAsync();
            return Results.Ok(vendors);
        });

        app.MapPost("/api/vendors", async (CreateVendorRequest request, AppDbContext db) =>
        {
            var vendor = new Vendor
            {
                Name = request.Name,
                Category = request.Category,
                TotalAmount = request.TotalAmount,
                IsPerPerson = request.IsPerPerson,
                PaidAmount = request.PaidAmount,
                DueDate = request.DueDate,
                IsHired = request.IsHired,
                Phone = request.Phone,
                Notes = request.Notes
            };

            db.Vendors.Add(vendor);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Fornecedor cadastrado com sucesso!", VendorId = vendor.Id });
        });

        app.MapPut("/api/vendors/{id:int}", async (int id, UpdateVendorRequest request, AppDbContext db) =>
        {
            var vendor = await db.Vendors.FindAsync(id);
            if (vendor is null) return Results.NotFound(new { Message = "Fornecedor não encontrado." });

            vendor.Name = request.Name;
            vendor.Category = request.Category;
            vendor.TotalAmount = request.TotalAmount;
            vendor.IsPerPerson = request.IsPerPerson;
            vendor.PaidAmount = request.PaidAmount;
            vendor.DueDate = request.DueDate;
            vendor.IsHired = request.IsHired;
            vendor.Phone = request.Phone;
            vendor.Notes = request.Notes;

            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Fornecedor atualizado com sucesso!" });
        });

        app.MapDelete("/api/vendors/{id:int}", async (int id, AppDbContext db) =>
        {
            var vendor = await db.Vendors.FindAsync(id);
            if (vendor is null) return Results.NotFound(new { Message = "Fornecedor não encontrado." });

            db.Vendors.Remove(vendor);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "Fornecedor excluído com sucesso!" });
        });
    }
}

public record CreateVendorRequest(string Name, string? Category, decimal? TotalAmount, bool IsPerPerson, decimal? PaidAmount, string? DueDate, bool IsHired, string? Phone, string? Notes);
public record UpdateVendorRequest(string Name, string? Category, decimal? TotalAmount, bool IsPerPerson, decimal? PaidAmount, string? DueDate, bool IsHired, string? Phone, string? Notes);