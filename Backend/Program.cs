using ElaDisseSim.Api.Database;
using ElaDisseSim.Api.Features.Rsvp;
using ElaDisseSim.Api.Features.Gifts;
using ElaDisseSim.Api.Features.Vendors;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configura o CORS para permitir requisições do frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// Configura o Entity Framework Core usando SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=eladissesim.db"));

var app = builder.Build();

app.UseCors("AllowFrontend");

// Garante que o banco de dados (e as tabelas) seja criado na inicialização
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Truque para adicionar a nova coluna na tabela existente sem perder dados
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Vendors\" ADD COLUMN \"IsPerPerson\" INTEGER NOT NULL DEFAULT 0;");
    }
    catch
    {
        // Se cair aqui, é porque a coluna já foi criada anteriormente, então apenas ignoramos!
    }
}

app.MapGet("/", () => "API do Ela Disse Sim está rodando!");

// Mapeia a rota /api/families
app.MapFamilyEndpoints();
app.MapGiftEndpoints();
app.MapVendorEndpoints();

app.Run();
