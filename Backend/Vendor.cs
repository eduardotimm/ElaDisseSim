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
    public string? PaymentDate { get; set; } // Nova data exata para o Calendário
    public int? Installments { get; set; } // Quantidade de Parcelas
    public int PaidInstallments { get; set; } = 0; // Quantidade de parcelas pagas
    public string Status { get; set; } = "A Consultar"; // A Consultar, Em Orçamento, Aguardando Contrato, Contratado, Quitado
    public bool ConsiderCost { get; set; } = true; // Se deve ser somado no dashboard
    public string? Phone { get; set; }
    public string? Notes { get; set; } // Anotações adicionais
}