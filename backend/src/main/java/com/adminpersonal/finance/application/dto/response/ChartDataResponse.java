package com.adminpersonal.finance.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataResponse {
    private int year;
    private String currency;
    private List<MonthDataPoint> months;

    public record MonthDataPoint(
        int month,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal balance
    ) {}
}
