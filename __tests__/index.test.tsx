import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import { VortexProvider, useVortexAuth } from "../src";
import React from "react";

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("VortexProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ error: "Unauthorized" }),
    } as Response);
  });

  it("renders without crashing", () => {
    render(
      <VortexProvider config={{ refreshJwtInterval: 0 }}>
        <div>Test child</div>
      </VortexProvider>
    );
  });

  it("provides auth context to children", () => {
    let contextValue: any = null;

    function TestComponent() {
      contextValue = useVortexAuth();
      return <div>Test</div>;
    }

    render(
      <VortexProvider config={{ refreshJwtInterval: 0 }}>
        <TestComponent />
      </VortexProvider>
    );

    expect(contextValue).toBeDefined();
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.jwt).toBeNull();
    expect(typeof contextValue.refreshJwt).toBe("function");
    expect(typeof contextValue.clearAuth).toBe("function");
  });

  it("starts with no JWT when refresh is disabled", () => {
    let contextValue: any = null;

    function TestComponent() {
      contextValue = useVortexAuth();
      return <div>Test</div>;
    }

    render(
      <VortexProvider config={{ refreshJwtInterval: 0 }}>
        <TestComponent />
      </VortexProvider>
    );

    expect(contextValue.isLoading).toBe(false);
    expect(contextValue.jwt).toBeNull();
    expect(contextValue.user).toBeNull();
  });
});
