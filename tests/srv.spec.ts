import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { describe } from "node:test";

const TEST_WORKSPACE_ID = process.env.TEST_WORKSPACE_ID;

test("server ok", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toBe("ok");
});

test.describe("check test workpace and update the namme of the workspace", () => {
  test.describe.configure({ mode: "serial" });
  let workspaceId: string;
  let workspaceUpdatedName = faker.commerce.department() + " " + "Modified";

  test("check test workspace exists", async ({ request }) => {
    expect(TEST_WORKSPACE_ID).toBeTruthy();

    const response = await request.get(`/workspaces/${TEST_WORKSPACE_ID}/`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.workspaceId).toBeTruthy();
    expect(body.name).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    const keys = Object.keys(body);
    expect(keys.length).toBe(4);

    workspaceId = body.workspaceId;
  });

  test("update the name of the workspace", async ({ request }) => {
    const data = {
      name: workspaceUpdatedName,
    };
    const response = await request.patch(`/workspaces/${workspaceId}/`, {
      data,
    });
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.workspaceId).toBeTruthy();
    expect(body.name).toBe(workspaceUpdatedName);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    const keys = Object.keys(body);
    expect(keys.length).toBe(4);
  });

  test("check the name of the workspace after update", async ({ request }) => {
    const response = await request.get(`/workspaces/${workspaceId}/`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.workspaceId).toBeTruthy();
    expect(body.name).toBe(workspaceUpdatedName);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    const keys = Object.keys(body);
    expect(keys.length).toBe(4);
  });
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

    const keys = Object.keys(workspace);
    expect(keys.length).toBe(4);
  }
});

describe("workspace members with random member check", () => {
  test.describe.configure({ mode: "serial" });
  let memberId: string;
  let memberName: string;
  test("check members with random member", async ({ request }) => {
    const response = await request.get(
      `/workspaces/${TEST_WORKSPACE_ID}/members/`
    );
    expect(response.status()).toBe(200);

    const items = await response.json();

    for (const item of items) {
      expect(item.memberId).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.role).toBeTruthy();
      expect(item.createdAt).toBeTruthy();
      expect(item.updatedAt).toBeTruthy();

      expect(item).not.toHaveProperty("workspaceId");

      const keys = Object.keys(item);
      expect(keys.length).toBe(5);
    }

    const member = items[0];
    memberId = member.memberId;
    memberName = member.name;
  });

  test("check member in workspace", async ({ request }) => {
    const response = await request.get(
      `/workspaces/${TEST_WORKSPACE_ID}/members/${memberId}/`
    );

    expect(response.status()).toBe(200);
    const member = await response.json();

    expect(member.memberId).toBe(memberId);
    expect(member.name).toBe(memberName);

    expect(member.role).toBeTruthy();
    expect(member.createdAt).toBeTruthy();
    expect(member.updatedAt).toBeTruthy();
  });
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

test.describe("create workspace with the fancy widget", () => {
  test.describe.configure({ mode: "serial" });

  const workspaceName = faker.commerce.department() + " " + "Space";
  let workspaceId: string;
  let fancyWidgetId: string;
  let fancyCreatedWidgetName: string;

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

  test("create fancy widget for workspace", async ({ request }) => {
    const fancyWidgetName = faker.commerce.department() + " " + "Widget";
    const data = {
      name: fancyWidgetName,
      configuration: {
        position: "right",
      },
    };

    const response = await request.post(`/workspaces/${workspaceId}/widgets/`, {
      data,
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.widgetId).toBeTruthy();
    expect(body.name).toBe(fancyWidgetName);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
    expect(body.configuration).toBeTruthy();

    expect(body.configuration.position).toBe("right");
    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(5);

    fancyWidgetId = body.widgetId;
    fancyCreatedWidgetName = body.name;
  });

  test("check list of widgets that were created", async ({ request }) => {
    const response = await request.get(`/workspaces/${workspaceId}/widgets/`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();

    let hasFancyWidget = false;

    expect(body.length).toBe(1);
    for (const widget of body) {
      expect(widget.widgetId).toBeTruthy();
      expect(widget.name).toBeTruthy();
      expect(widget.createdAt).toBeTruthy();
      expect(widget.updatedAt).toBeTruthy();
      expect(widget.configuration).toBeTruthy();

      expect(widget).not.toHaveProperty("workspaceId");

      const keys = Object.keys(widget);
      expect(keys.length).toBe(5);

      if (
        widget.name === fancyCreatedWidgetName &&
        widget.widgetId === fancyWidgetId
      ) {
        hasFancyWidget = true;
      }
    }

    expect(hasFancyWidget).toBeTruthy();
  });
});

test.describe("create workspace with a secret key", () => {
  test.describe.configure({ mode: "serial" });

  const workspaceName = faker.commerce.department() + " " + "Space";
  let workspaceId: string;
  let secretKey: string;

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

    const keys = Object.keys(workspaceRespBody);
    expect(keys.length).toBe(4);

    workspaceId = workspaceRespBody.workspaceId;
  });

  test("create a secret key", async ({ request }) => {
    const data = {};
    const response = await request.post(`/workspaces/${workspaceId}/sk/`, {
      data,
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.secretKey).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(3);
    secretKey = body.secretKey;
  });

  test("check the created secret key", async ({ request }) => {
    const response = await request.get(`/workspaces/${workspaceId}/sk/`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.secretKey).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    expect(body).not.toHaveProperty("workspaceId");

    const keys = Object.keys(body);
    expect(keys.length).toBe(3);

    expect(body.secretKey).toBe(secretKey);
  });
});

test("create secret key for test workspace", async ({ request }) => {
  expect(TEST_WORKSPACE_ID).toBeTruthy();
  const response = await request.post(`/workspaces/${TEST_WORKSPACE_ID}/sk/`, {
    data: {},
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.secretKey).toBeTruthy();
  expect(body.createdAt).toBeTruthy();
  expect(body.updatedAt).toBeTruthy();

  expect(body).not.toHaveProperty("workspaceId");

  const keys = Object.keys(body);
  expect(keys.length).toBe(3);
});
