import Machine from "../models/machine.model/machine.model";
import MachineType from "../models/machine.model/machineType.model";
import calculateTotalPrice from "../services/calculatePrice";

jest.mock("../models/machine.model/machine.model");
jest.mock("../models/machine.model/machineType.model");

describe("calculateTotalPrice - Input Validation", () => {
  it("should throw an error when startTime is missing", async () => {
    await expect(
      calculateTotalPrice(null as any, new Date(), [
        { machineID: "123", userCount: 1 },
      ])
    ).rejects.toThrow("Invalid input: startTime, endTime, or machines missing");
  });

  it("should throw an error when endTime is missing", async () => {
    await expect(
      calculateTotalPrice(new Date(), null as any, [
        { machineID: "123", userCount: 1 },
      ])
    ).rejects.toThrow("Invalid input: startTime, endTime, or machines missing");
  });

  it("should throw an error when machines array is empty", async () => {
    await expect(
      calculateTotalPrice(new Date(), new Date(), [])
    ).rejects.toThrow("Invalid input: startTime, endTime, or machines missing");
  });
});

describe("calculateTotalPrice - Duration Boundaries", () => {
  beforeEach(() => {
    (Machine.findById as jest.Mock).mockResolvedValue({
      machineType: "validType",
    });
    (MachineType.findById as jest.Mock).mockResolvedValue({
      rateByPlayers: { 1: 100 },
    }); // Rate per hour: 100
  });

  it("should throw an error for zero duration", async () => {
    const now = new Date();
    await expect(
      calculateTotalPrice(now, now, [{ machineID: "123", userCount: 1 }])
    ).rejects.toThrow("Invalid booking duration");
  });

  it("should allow minimum valid duration (1 minute)", async () => {
    const now = new Date();
    const later = new Date(now.getTime() + 60000); // 1 minute later
    const result = await calculateTotalPrice(now, later, [
      { machineID: "123", userCount: 1 },
    ]);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("should allow maximum valid duration (23 hours, 59 minutes)", async () => {
    const now = new Date();
    const later = new Date(
      now.getTime() + 23 * 60 * 60 * 1000 + 59 * 60 * 1000
    ); // 23:59 hours later
    const result = await calculateTotalPrice(now, later, [
      { machineID: "123", userCount: 1 },
    ]);
    expect(result).toBeGreaterThan(0);
  });

  it("should throw an error for negative duration (endTime before startTime)", async () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 60000); // 1 minute before
    await expect(
      calculateTotalPrice(now, earlier, [{ machineID: "123", userCount: 1 }])
    ).rejects.toThrow("Invalid booking duration");
  });
});

describe("calculateTotalPrice - Machine & Pricing Boundaries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error for invalid machine ID", async () => {
    (Machine.findById as jest.Mock).mockResolvedValue(null);
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60000); // 60 mins later
    await expect(
      calculateTotalPrice(start, end, [{ machineID: "invalid", userCount: 1 }])
    ).rejects.toThrow("Machine not found: invalid");
  });

  it("should throw an error for invalid machine type", async () => {
    (Machine.findById as jest.Mock).mockResolvedValue({
      machineType: "invalidType",
    });
    (MachineType.findById as jest.Mock).mockResolvedValue(null);

    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60000); // 60 mins later

    await expect(
      calculateTotalPrice(start, end, [{ machineID: "123", userCount: 1 }])
    ).rejects.toThrow("MachineType not found for machine: 123");
  });

  it("should throw an error when rate is not found for the given user count", async () => {
    (Machine.findById as jest.Mock).mockResolvedValue({
      machineType: "validType",
    });
    (MachineType.findById as jest.Mock).mockResolvedValue({
      rateByPlayers: {},
    });

    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60000); // 60 mins later

    await expect(
      calculateTotalPrice(start, end, [{ machineID: "123", userCount: 3 }])
    ).rejects.toThrow("Rate not found for 3 players in MachineType undefined");
  });
});

describe("calculateTotalPrice - Pricing Based on Time Intervals", () => {
  beforeEach(() => {
    (Machine.findById as jest.Mock).mockResolvedValue({
      machineType: "validType",
    });
    (MachineType.findById as jest.Mock).mockResolvedValue({
      rateByPlayers: { 1: 100 },
    }); // Rate per hour: 100
  });

  it("should not charge rate for 14 minutes", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 14 * 60000); // 14 mins later
    const price = await calculateTotalPrice(start, end, [
      { machineID: "123", userCount: 1 },
    ]);
    expect(price).toBeCloseTo(0);
  });

  it("should charge half-rate for 15 minutes", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 15 * 60000); // 15 mins later
    const price = await calculateTotalPrice(start, end, [
      { machineID: "123", userCount: 1 },
    ]);
    expect(price).toBe(60); // 50% + 10% of that
  });

  it("should charge half-rate for 16 minutes", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 16 * 60000); // 16 mins later
    const price = await calculateTotalPrice(start, end, [
      { machineID: "123", userCount: 1 },
    ]);
    expect(price).toBe(60);
  });

  it("should charge half-rate for 44 minutes", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 44 * 60000); // 44 mins later
    const price = await calculateTotalPrice(start, end, [
      { machineID: "123", userCount: 1 },
    ]);
    expect(price).toBe(60);
  });

  it("should charge full hour for 45 minutes", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 45 * 60000); // 45 mins later
    const price = await calculateTotalPrice(start, end, [
      { machineID: "123", userCount: 1 },
    ]);
    expect(price).toBe(100);
  });

  it("should charge exactly 1 hour for 60-minute booking", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60000); // 60 mins later
    const price = await calculateTotalPrice(start, end, [
      { machineID: "123", userCount: null },
    ]);
    expect(price).toBe(100);
  });

  it("should charge full hour for 1 hour 15 minutes", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 75 * 60000); // 1 hour 15 mins later
    const price = await calculateTotalPrice(start, end, [
      { machineID: "123", userCount: 1 },
    ]);
    expect(price).toBe(160);
  });
});
