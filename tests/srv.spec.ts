import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("server ok", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toBe("ok");
});

test("list of workspaces where user is a member", async ({ request }) => {
  const response = await request.get("/workspaces/");

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  const body = await response.json();
  for (const workspace of body) {
    expect(workspace.workspaceId).toBeTruthy();
    expect(workspace.name).toBeTruthy();
    expect(workspace.createdAt).toBeTruthy();
    expect(workspace.updatedAt).toBeTruthy();
  }
});

test.describe("create workspace with member flow", () => {
  test.describe.configure({ mode: "serial" });

  const workspaceName = faker.commerce.department() + " " + "Space";
  let workspaceId: string;

  test("create the workspace", async ({ request }) => {
    const data = {
      name: workspaceName,
    };
    const workspaceResponse = await request.post("/workspaces/", {
      data,
    });
    expect(workspaceResponse.ok()).toBeTruthy();
    expect(workspaceResponse.status()).toBe(201);

    const workspaceRespBody = await workspaceResponse.json();
    expect(workspaceRespBody.workspaceId).toBeTruthy();
    expect(workspaceRespBody.name).toBe(workspaceName); // make sure we got the name we sent
    expect(workspaceRespBody.createdAt).toBeTruthy();
    expect(workspaceRespBody.updatedAt).toBeTruthy();
    workspaceId = workspaceRespBody.workspaceId;
  });

  test("make sure user is the primary member", async ({ request }) => {
    const response = await request.get(
      `/workspaces/${workspaceId}/members/me/`
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.memberId).toBeTruthy();
    expect(body.name).toBeTruthy();
    expect(body.role).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    expect(body.role).toBe("primary");

    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(5);
  });

  test("check all the members with atleast 1 primary", async ({ request }) => {
    const response = await request.get(`/workspaces/${workspaceId}/members/`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();

    let hasPrimaryMember = false;
    let primaryMemberCount = 0;

    for (const member of body) {
      if (member.role === "primary") hasPrimaryMember = true;
      if (member.role === "primary") primaryMemberCount++;
      expect(member.memberId).toBeTruthy();
      expect(member.name).toBeTruthy();
      expect(member.role).toBeTruthy();
      expect(member.createdAt).toBeTruthy();
      expect(member.updatedAt).toBeTruthy();

      expect(member).not.toHaveProperty("workspaceId");

      const keys = Object.keys(member);
      expect(keys.length).toBe(5);
    }
    expect(hasPrimaryMember).toBe(true);
    expect(primaryMemberCount).toBe(1);
  });
});

test.describe("create workspace with customer flow", () => {
  test.describe.configure({ mode: "serial" });

  const workspaceName = faker.commerce.department() + " " + "Space";
  let workspaceId: string;
  let createdCustomerIdForEmail: string;
  let createdCustomerIdForPhone: string;
  let createdCustomerIdForExternalId: string;

  test("create the workspace", async ({ request }) => {
    const data = {
      name: workspaceName,
    };
    const workspaceResponse = await request.post("/workspaces/", {
      data,
    });
    expect(workspaceResponse.ok()).toBeTruthy();
    expect(workspaceResponse.status()).toBe(201);

    const workspaceRespBody = await workspaceResponse.json();
    expect(workspaceRespBody.workspaceId).toBeTruthy();
    expect(workspaceRespBody.name).toBe(workspaceName); // make sure we got the name we sent
    expect(workspaceRespBody.createdAt).toBeTruthy();
    expect(workspaceRespBody.updatedAt).toBeTruthy();
    workspaceId = workspaceRespBody.workspaceId;
  });

  test("create a customer with email", async ({ request }) => {
    const email = faker.internet.email();
    const name = faker.person.firstName();
    const data = {
      email,
      name,
    };
    const response = await request.post(
      `/workspaces/${workspaceId}/customers/`,
      {
        data,
      }
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.customerId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.email).toBe(email);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
    expect(body.externalId).toBeNull();
    expect(body.phone).toBeNull();
    expect(body.role).toBeTruthy();
    expect(body.isVerified).toBeTruthy();

    expect(body.role).toBe("engaged");
    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(9);

    createdCustomerIdForEmail = body.customerId;
  });

  test("create customer with external id", async ({ request }) => {
    const externalId = faker.string.nanoid();
    const name = faker.person.firstName();
    const data = {
      externalId,
      name,
    };
    const response = await request.post(
      `/workspaces/${workspaceId}/customers/`,
      {
        data,
      }
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.customerId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.email).toBeNull();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
    expect(body.externalId).toBe(externalId);
    expect(body.phone).toBeNull();
    expect(body.role).toBeTruthy();
    expect(body.isVerified).toBeTruthy();

    expect(body.role).toBe("engaged");
    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(9);

    createdCustomerIdForExternalId = body.customerId;
  });

  test("create customer with phone", async ({ request }) => {
    const phone = faker.phone.number();
    const name = faker.person.firstName();
    const data = {
      phone,
      name,
    };
    const response = await request.post(
      `/workspaces/${workspaceId}/customers/`,
      {
        data,
      }
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.customerId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.email).toBeNull();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
    expect(body.externalId).toBeNull();
    expect(body.phone).toBe(phone);
    expect(body.role).toBeTruthy();
    expect(body.isVerified).toBeTruthy();

    expect(body.role).toBe("engaged");
    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(9);

    createdCustomerIdForPhone = body.customerId;
  });

  test("check list of customers that were created", async ({ request }) => {
    const response = await request.get(`/workspaces/${workspaceId}/customers/`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();

    let hasCustomerWithEmail = false;
    let hasCustomerWithExternalId = false;
    let hasCustomerWithPhone = false;

    expect(body.length).toBe(3);
    for (const customer of body) {
      expect(customer.customerId).toBeTruthy();
      expect(customer.name).toBeTruthy();
      expect(customer.createdAt).toBeTruthy();
      expect(customer.updatedAt).toBeTruthy();
      expect(customer.isVerified).toBeTruthy();
      expect(customer.role).toBeTruthy();

      expect(customer).toHaveProperty("email");
      expect(customer).toHaveProperty("phone");
      expect(customer).toHaveProperty("externalId");

      expect(customer).not.toHaveProperty("workspaceId");

      const keys = Object.keys(customer);
      expect(keys.length).toBe(9);

      if (customer.customerId === createdCustomerIdForExternalId) {
        hasCustomerWithExternalId = true;
      }
      if (customer.customerId === createdCustomerIdForPhone) {
        hasCustomerWithPhone = true;
      }
      if (customer.customerId === createdCustomerIdForEmail) {
        hasCustomerWithEmail = true;
      }
    }

    expect(hasCustomerWithEmail).toBeTruthy();
    expect(hasCustomerWithExternalId).toBeTruthy();
    expect(hasCustomerWithPhone).toBeTruthy();
  });

  test("create customer with externalId, email and phone", async ({
    request,
  }) => {
    const externalId = faker.string.nanoid();
    const email = faker.internet.email();
    const phone = faker.phone.number();
    const name = faker.person.firstName();
    const data = {
      externalId,
      email,
      phone,
      name,
    };
    const response = await request.post(
      `/workspaces/${workspaceId}/customers/`,
      {
        data,
      }
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.customerId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
    expect(body.externalId).toBe(externalId);
    expect(body.email).toBeNull();
    expect(body.phone).toBeNull();
    expect(body.isVerified).toBeTruthy();
    expect(body.role).toBe("engaged");

    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(9);
  });

  test("create customer with email, phone", async ({ request }) => {
    const email = faker.internet.email();
    const phone = faker.phone.number();
    const name = faker.person.firstName();
    const data = {
      email,
      phone,
      name,
    };
    const response = await request.post(
      `/workspaces/${workspaceId}/customers/`,
      {
        data,
      }
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.customerId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    expect(body.externalId).toBeNull();
    expect(body.email).toBe(email);
    expect(body.phone).toBeNull();
    expect(body.isVerified).toBeTruthy();
    expect(body.role).toBe("engaged");

    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(9);
  });

  test("create customer with phone only", async ({ request }) => {
    const phone = faker.phone.number();
    const name = faker.person.firstName();
    const data = {
      phone,
      name,
    };
    const response = await request.post(
      `/workspaces/${workspaceId}/customers/`,
      {
        data,
      }
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.customerId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    expect(body.externalId).toBeNull();
    expect(body.phone).toBe(phone);
    expect(body.isVerified).toBeTruthy();
    expect(body.role).toBe("engaged");

    expect(body).not.toHaveProperty("workspaceId");
    const keys = Object.keys(body);
    expect(keys.length).toBe(9);
  });
});
