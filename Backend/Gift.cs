namespace ElaDisseSim.Api.Features.Gifts;

public class Gift
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty; // Ex: "Cotas de Lua de Mel" ou "Geladeira"
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsPurchased { get; set; } // Flag para saber se já presentearam
    public string? PurchasedBy { get; set; } // Adicione isso!

}