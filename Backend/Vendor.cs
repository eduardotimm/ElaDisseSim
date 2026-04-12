namespace ElaDisseSim.Api.Features.Vendors;

public class Vendor
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; } // Doces, Decoração, etc.
    public decimal? TotalAmount { get; set; }
    public bool IsPerPerson { get; set; } // Marca se o preço deve ser multiplicado pelos convidados
    public decimal? PaidAmount { get; set; }
    public string? DueDate { get; set; }
    public bool IsHired { get; set; } // Fechado (true) ou Em orçamento (false)
    public string? Phone { get; set; }
    public string? Notes { get; set; } // Anotações adicionais
}