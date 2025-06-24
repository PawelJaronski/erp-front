"use client";
import { useState } from "react";

export default function SimpleExpenseForm() {
    const [account, setAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [businessDate, setBusinessDate] = useState("");
    const transaction_type = "expense";
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            transaction_type,
            event_type: "cost_paid",
            account,
            category_group: "opex",
            category,
            gross_amount: amount,
            business_timestamp: businessDate,
        }
        try {
            const response = await fetch("https://erp.jaronski.pl/add-transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Błąd serwera (${response.status}): ${body}`);
        }
        const data = await response.json();
        console.log("Sukces", data);
        alert("Transakcja wysłana!");
        }
        catch (error) {
            console.error("Błąd:", error);
            alert("Coś poszło nie tak: " + (error as Error).message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="account">Konto:</label>
            <input 
                id="account" 
                name="account" 
                type="text" 
                value={account} 
                onChange={(e) => setAccount(e.target.value)}
            />
            <label htmlFor="amount">Kwota brutto:</label>
            <input 
                id="amount" 
                name="amount" 
                type="text" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
            />
            <label htmlFor="category">Kategoria:</label>
            <input 
                id="category" 
                name="category" 
                type="text" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
            />
            <label htmlFor="businessDate">Data księgowania:</label>
            <input 
                id="businessDate" 
                name="businessDate" 
                type="text" 
                value={businessDate} 
                onChange={(e) => setBusinessDate(e.target.value)}
            />
            <button type="submit">Submit</button>
        </form>
    );
}