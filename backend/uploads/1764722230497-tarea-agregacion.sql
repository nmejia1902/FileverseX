use classicmodels;

SELECT 
    e.employeeNumber AS "ID Empleado",
    CONCAT(e.firstName, ' ', e.lastName) AS "Nombre Completo",
    (SELECT COUNT(*) FROM customers c WHERE c.salesRepEmployeeNumber = e.employeeNumber) AS Clientes_Atendidos
FROM 
    employees e
ORDER BY 
    Clientes_Atendidos DESC;
    
    
    
    
SELECT 
    c.customerNumber AS "Número de Cliente",
    c.customerName AS "Nombre de Cliente",
    COUNT(p.amount) AS "Cantidad de Pagos",
    SUM(p.amount) AS "Monto Total"
FROM 
    customers c
INNER JOIN 
    payments p ON c.customerNumber = p.customerNumber
GROUP BY 
    c.customerNumber, c.customerName
ORDER BY 
    SUM(p.amount) ASC;
    
    
    


SELECT 
    YEAR(paymentDate) AS Año,
    SUM(amount) AS "Monto Total Acumulado"
FROM 
    payments
GROUP BY 
    YEAR(paymentDate)
ORDER BY 
    Año;
    
    
    
    
    
SELECT 
    MONTH(paymentDate) AS Mes,
    SUM(amount) AS 'Monto Total'
FROM 
    payments
GROUP BY 
    MONTH(paymentDate)
HAVING 
    SUM(amount) > 600000.00
ORDER BY 
    Mes;
    
    
    
    
    
SELECT 
    country AS 'País',
    COUNT(customerNumber) AS 'Número de Clientes',
    AVG(creditLimit) AS 'Promedio de Límite de Crédito'
FROM 
    customers
GROUP BY 
    country
HAVING 
    COUNT(customerNumber) >= 5
ORDER BY 
    AVG(creditLimit) DESC;
    