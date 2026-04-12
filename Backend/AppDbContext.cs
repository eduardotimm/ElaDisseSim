using ElaDisseSim.Api.Features.Rsvp;
using ElaDisseSim.Api.Features.Gifts;
using Microsoft.EntityFrameworkCore;

namespace ElaDisseSim.Api.Database;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Family> Families => Set<Family>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Gift> Gifts => Set<Gift>();
    public DbSet<ElaDisseSim.Api.Features.Vendors.Vendor> Vendors { get; set; }
}