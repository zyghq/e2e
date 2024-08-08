import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const TEST_WORKSPACE_ID = process.env.TEST_WORKSPACE_ID;

// query
test("query list members of the workspace", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/members/`
  );
  expect(response.status()).toBe(200);
  const body = await response.json();
  for (const member of body) {
    expect(member.memberId).toBeTruthy();
    expect(member.name).toBeTruthy();
    expect(member.role).toBeTruthy();
    expect(member.createdAt).toBeTruthy();
    expect(member.updatedAt).toBeTruthy();

    expect(member).not.toHaveProperty("workspaceId");

    const keys = Object.keys(member);
    expect(keys.length).toBe(5);
  }
});

// query
test("query my workspace membership", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/members/me/`
  );
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.memberId).toBeTruthy();
  expect(body.name).toBeTruthy();
  expect(body.role).toBeTruthy();
  expect(body.createdAt).toBeTruthy();
  expect(body.updatedAt).toBeTruthy();

  expect(body).not.toHaveProperty("workspaceId");

  const keys = Object.keys(body);
  expect(keys.length).toBe(5);
});

// query
test("query make sure Im the primary member of the workspace", async ({
  request,
}) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/members/me/`
  );
  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.role).toBe("primary");
  expect(body).not.toHaveProperty("workspaceId");
  const keys = Object.keys(body);
  expect(keys.length).toBe(5);
});

// mutation
// test.describe("mutate create workspace customers with different identities", () => {
//   test.describe.configure({ mode: "serial" });
//   test("create customer with email", async ({ request }) => {
//     const email = faker.internet.email();
//     const name = faker.person.firstName();
//     const data = {
//       email,
//       name,
//     };
//     const response = await request.post(
//       `/workspaces/${TEST_WORKSPACE_ID}/customers/`,
//       {
//         data,
//       }
//     );
//     expect(response.ok()).toBeTruthy();
//     expect(response.status()).toBe(201);

//     const body = await response.json();
//     expect(body.customerId).toBeTruthy();
//     expect(body.name).toBe(name);
//     expect(body.email).toBe(email);
//     expect(body.createdAt).toBeTruthy();
//     expect(body.updatedAt).toBeTruthy();
//     expect(body.externalId).toBeNull();
//     expect(body.phone).toBeNull();
//     expect(body.role).toBeTruthy();
//     expect(body.isVerified).toBeTruthy();

//     expect(body.role).toBe("engaged");
//     expect(body).not.toHaveProperty("workspaceId");

//     const keys = Object.keys(body);
//     expect(keys.length).toBe(9);
//   });

//   test("create customer with phone", async ({ request }) => {
//     const phone = faker.phone.number();
//     const name = faker.person.firstName();
//     const data = {
//       phone,
//       name,
//     };
//     const response = await request.post(
//       `/workspaces/${TEST_WORKSPACE_ID}/customers/`,
//       {
//         data,
//       }
//     );
//     expect(response.ok()).toBeTruthy();
//     expect(response.status()).toBe(201);

//     const body = await response.json();
//     expect(body.customerId).toBeTruthy();
//     expect(body.name).toBe(name);
//     expect(body.email).toBeNull();
//     expect(body.createdAt).toBeTruthy();
//     expect(body.updatedAt).toBeTruthy();
//     expect(body.externalId).toBeNull();
//     expect(body.phone).toBe(phone);
//     expect(body.role).toBeTruthy();
//     expect(body.isVerified).toBeTruthy();

//     expect(body.role).toBe("engaged");
//     expect(body).not.toHaveProperty("workspaceId");

//     const keys = Object.keys(body);
//     expect(keys.length).toBe(9);
//   });

//   test("create customer with externalId", async ({ request }) => {
//     const externalId = faker.string.nanoid();
//     const name = faker.person.firstName();
//     const data = {
//       externalId,
//       name,
//     };
//     const response = await request.post(
//       `/workspaces/${TEST_WORKSPACE_ID}/customers/`,
//       {
//         data,
//       }
//     );
//     expect(response.ok()).toBeTruthy();
//     expect(response.status()).toBe(201);

//     const body = await response.json();
//     expect(body.customerId).toBeTruthy();
//     expect(body.name).toBe(name);
//     expect(body.email).toBeNull();
//     expect(body.createdAt).toBeTruthy();
//     expect(body.updatedAt).toBeTruthy();
//     expect(body.externalId).toBe(externalId);
//     expect(body.phone).toBeNull();
//     expect(body.role).toBeTruthy();
//     expect(body.isVerified).toBeTruthy();

//     expect(body.role).toBe("engaged");
//     expect(body).not.toHaveProperty("workspaceId");

//     const keys = Object.keys(body);
//     expect(keys.length).toBe(9);
//   });

//   test("create customer with externalId, email and phone", async ({
//     request,
//   }) => {
//     const externalId = faker.string.nanoid();
//     const email = faker.internet.email();
//     const phone = faker.phone.number();
//     const name = faker.person.firstName();
//     const data = {
//       externalId,
//       email,
//       phone,
//       name,
//     };
//     const response = await request.post(
//       `/workspaces/${TEST_WORKSPACE_ID}/customers/`,
//       {
//         data,
//       }
//     );
//     expect(response.ok()).toBeTruthy();
//     expect(response.status()).toBe(201);

//     const body = await response.json();
//     expect(body.customerId).toBeTruthy();
//     expect(body.name).toBe(name);
//     expect(body.createdAt).toBeTruthy();
//     expect(body.updatedAt).toBeTruthy();
//     expect(body.externalId).toBe(externalId);
//     expect(body.email).toBeNull();
//     expect(body.phone).toBeNull();
//     expect(body.isVerified).toBeTruthy();
//     expect(body.role).toBe("engaged");

//     expect(body).not.toHaveProperty("workspaceId");

//     const keys = Object.keys(body);
//     expect(keys.length).toBe(9);
//   });
// });

// query
test("query list of customers that were created", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/customers/`
  );
  expect(response.status()).toBe(200);

  const body = await response.json();

  console.log(body);

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
  }
});

// mutation
// test.describe("create workspace secret key", () => {
//   test.describe.configure({ mode: "serial" });
//   let secretKey: string;
//   test("create workspace secret key", async ({ request }) => {
//     const data = {};
//     const response = await request.post(
//       `/workspaces/${TEST_WORKSPACE_ID}/sk/`,
//       {
//         data,
//       }
//     );
//     expect(response.status()).toBe(201);

//     const body = await response.json();
//     expect(body.secretKey).toBeTruthy();
//     expect(body.createdAt).toBeTruthy();
//     expect(body.updatedAt).toBeTruthy();

//     expect(body).not.toHaveProperty("workspaceId");

//     const keys = Object.keys(body);
//     expect(keys.length).toBe(3);

//     secretKey = body.secretKey;
//   });

//   test("check the created secret key", async ({ request }) => {
//     const response = await request.get(`/workspaces/${TEST_WORKSPACE_ID}/sk/`);
//     expect(response.status()).toBe(200);

//     const body = await response.json();
//     expect(body.secretKey).toBe(secretKey);
//     expect(body.createdAt).toBeTruthy();
//     expect(body.updatedAt).toBeTruthy();

//     expect(body).not.toHaveProperty("workspaceId");

//     const keys = Object.keys(body);
//     expect(keys.length).toBe(3);
//   });
// });

// mutation
// test("create a widget", async ({ request }) => {
//   const widgetName = faker.commerce.department() + " " + "Widget";
//   const data = {
//     name: widgetName,
//     configuration: {
//       position: "right",
//     },
//   };

//   const response = await request.post(
//     `/workspaces/${TEST_WORKSPACE_ID}/widgets/`,
//     {
//       data,
//     }
//   );
//   expect(response.status()).toBe(201);

//   const body = await response.json();

//   console.log(body);

//   expect(body.widgetId).toBeTruthy();
//   expect(body.name).toBe(widgetName);
//   expect(body.createdAt).toBeTruthy();
//   expect(body.updatedAt).toBeTruthy();
//   expect(body.configuration).toBeTruthy();

//   expect(body.configuration.position).toBe("right");
//   expect(body).not.toHaveProperty("workspaceId");

//   const keys = Object.keys(body);
//   expect(keys.length).toBe(5);
// });
