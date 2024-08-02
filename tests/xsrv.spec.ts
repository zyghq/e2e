import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const baseUrl = process.env.ZYG_XSRV_URL;

const TEST_WORKSPACE_ID = process.env.TEST_WORKSPACE_ID;

const TEST_WIDGET_ID = process.env.TEST_WIDGET_ID;

test("server ok", async ({ request }) => {
  const response = await request.get(`${baseUrl}/`);
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toBe("ok");
});

test.describe("init workspace widget", () => {
  test.describe.configure({ mode: "serial" });
  test("init anonymous customer widget with name only", async ({ request }) => {
    const anonymousId = faker.string.uuid();
    const customerTraits = {
      name: faker.person.firstName(),
    };
    const data = {
      anonId: anonymousId,
      traits: customerTraits,
    };
    const response = await request.post(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/init/`,
      { data }
    );

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.jwt).toBeTruthy();
    expect(body.isVerified).toBe(false);
    expect(body.name).toBeTruthy();
    expect(body.email).toBe("");
    expect(body.phone).toBe("");
    expect(body.externalId).toBe("");

    expect(body).not.toHaveProperty("workspaceId");
    expect(body).toHaveProperty("jwt");
    expect(body).toHaveProperty("isVerified");
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("phone");
    expect(body).toHaveProperty("externalId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(7);
  });

  test("init anonymous customer widget with firsname, lastname", async ({
    request,
  }) => {
    const anonymousId = faker.string.uuid();
    const customerTraits = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const data = {
      anonId: anonymousId,
      traits: customerTraits,
    };
    const response = await request.post(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/init/`,
      { data }
    );

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.jwt).toBeTruthy();
    expect(body.isVerified).toBe(false);
    expect(body.name).toBeTruthy();
    expect(body.email).toBe("");
    expect(body.phone).toBe("");
    expect(body.externalId).toBe("");

    expect(body).not.toHaveProperty("workspaceId");
    expect(body).toHaveProperty("jwt");
    expect(body).toHaveProperty("isVerified");
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("phone");
    expect(body).toHaveProperty("externalId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(7);
  });

  test("init anonymous customer widget with firsname only", async ({
    request,
  }) => {
    const anonymousId = faker.string.uuid();
    const customerTraits = {
      firstName: faker.person.firstName(),
    };
    const data = {
      anonId: anonymousId,
      traits: customerTraits,
    };
    const response = await request.post(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/init/`,
      { data }
    );

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.jwt).toBeTruthy();
    expect(body.isVerified).toBe(false);
    expect(body.name).toBeTruthy();
    expect(body.email).toBe("");
    expect(body.phone).toBe("");
    expect(body.externalId).toBe("");

    expect(body).not.toHaveProperty("workspaceId");
    expect(body).toHaveProperty("jwt");
    expect(body).toHaveProperty("isVerified");
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("phone");
    expect(body).toHaveProperty("externalId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(7);
  });

  test("init anonymous customer widget with lastname only", async ({
    request,
  }) => {
    const anonymousId = faker.string.uuid();
    const customerTraits = {
      lastName: faker.person.lastName(),
    };
    const data = {
      anonId: anonymousId,
      traits: customerTraits,
    };
    const response = await request.post(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/init/`,
      { data }
    );

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.jwt).toBeTruthy();
    expect(body.isVerified).toBe(false);
    expect(body.name).toBeTruthy();
    expect(body.email).toBe("");
    expect(body.phone).toBe("");
    expect(body.externalId).toBe("");

    expect(body).not.toHaveProperty("workspaceId");
    expect(body).toHaveProperty("jwt");
    expect(body).toHaveProperty("isVerified");
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("phone");
    expect(body).toHaveProperty("externalId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(7);
  });
});

test.describe("init workspace with customer flow", () => {
  test.describe.configure({ mode: "serial" });
  let customerJwt: string;
  let customerName: string;
  test("init anonymous customer widget name", async ({ request }) => {
    const anonymousId = faker.string.uuid();
    const customerTraits = {
      name: faker.person.firstName(),
    };
    const data = {
      anonId: anonymousId,
      traits: customerTraits,
    };
    const response = await request.post(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/init/`,
      { data }
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.jwt).toBeTruthy();
    expect(body.isVerified).toBe(false);
    expect(body.name).toBeTruthy();
    expect(body.email).toBe("");
    expect(body.phone).toBe("");
    expect(body.externalId).toBe("");

    expect(body).not.toHaveProperty("workspaceId");
    expect(body).toHaveProperty("jwt");
    expect(body).toHaveProperty("isVerified");
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("phone");
    expect(body).toHaveProperty("externalId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(7);

    customerJwt = body.jwt;
    customerName = body.name;
  });

  test("widget check customer", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/me/`,
      {
        headers: {
          Authorization: `Bearer ${customerJwt}`,
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.name).toBe(customerName);
    expect(body.email).toBe("");
    expect(body.phone).toBe("");
    expect(body.externalId).toBe("");

    expect(body).not.toHaveProperty("workspaceId");
    expect(body.isVerified).toBe(false);
    expect(body.role).toBe("visitor");
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    const keys = Object.keys(body);
    expect(keys.length).toBe(9);
  });
});
