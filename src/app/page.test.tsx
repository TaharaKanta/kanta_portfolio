import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("next/image", () => ({
  default: () => null,
}));

describe("Home page", () => {
  it("renders connectivity check UI", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: "Investment Portfolio Simulator" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FMP API 疎通確認" })).toBeInTheDocument();
  });
});
