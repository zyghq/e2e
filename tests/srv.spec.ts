import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const TEST_WORKSPACE_ID = process.env.TEST_WORKSPACE_ID;

test("server ok", async ({ request }) => {
  const response = await request.get("/");
  const text = await response.text();
  expect(response.ok()).toBeTruthy();
  expect(text).toBe("ok");
});

test("list of workspaces where user is a member", async ({ request }) => {
  const response = await request.get("/workspaces/");

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  for (const workspace of body) {
    expect(workspace.workspaceId).toBeTruthy();
    expect(workspace.name).toBeTruthy();
    expect(workspace.createdAt).toBeTruthy();
    expect(workspace.updatedAt).toBeTruthy();
  }
});

// test("create a workspace with the primary member", async ({ request }) => {
//   // generate awesome faker workspace name
//   const genWorkspaceName = faker.commerce.department() + " " + "Space";
//   const data = {
//     name: genWorkspaceName,
//   };

//   // make sure we make request to our server
//   const workspaceResponse = await request.post("/workspaces/", {
//     data,
//   });

//   expect(workspaceResponse.ok()).toBeTruthy();
//   expect(workspaceResponse.status()).toBe(201);

//   const workspaceRespBody = await workspaceResponse.json();
//   expect(workspaceRespBody.workspaceId).toBeTruthy();
//   expect(workspaceRespBody.name).toBe(genWorkspaceName); // make sure we got the name we sent
//   expect(workspaceRespBody.createdAt).toBeTruthy();
//   expect(workspaceRespBody.updatedAt).toBeTruthy();

//   // make sure we have a primary member
//   const primaryMemberResponse = await request.get(
//     `/workspaces/${workspaceRespBody.workspaceId}/members/me/`
//   );
//   expect(primaryMemberResponse.ok()).toBeTruthy();
//   expect(primaryMemberResponse.status()).toBe(200);

//   const primaryMemberBody = await primaryMemberResponse.json();
//   expect(primaryMemberBody.memberId).toBeTruthy();
//   expect(primaryMemberBody.name).toBeTruthy();
//   expect(primaryMemberBody.role).toBeTruthy();
//   expect(primaryMemberBody.createdAt).toBeTruthy();
//   expect(primaryMemberBody.updatedAt).toBeTruthy();

//   // make sure the member is a primary member
//   expect(primaryMemberBody.role).toBe("primary");
// });

test("my workspace membership", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/members/me/`
  );
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.memberId).toBeTruthy();
  expect(body.name).toBeTruthy();
  expect(body.role).toBeTruthy();
  expect(body.createdAt).toBeTruthy();
  expect(body.updatedAt).toBeTruthy();
});

test("workspace has members with atleast 1 primary", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/members/`
  );
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
  }

  expect(hasPrimaryMember).toBeTruthy();
  expect(primaryMemberCount).toBe(1);
});

test("workspace customers", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/customers/`
  );
  const requestBody = await response.json();
  for (const customer of requestBody) {
    expect(customer).not.toHaveProperty("workspaceId");
    expect(customer.customerId).toBeTruthy();
    expect(customer.name).toBeTruthy();

    expect(customer).toHaveProperty("email");
    expect(customer).toHaveProperty("phone");
    expect(customer).toHaveProperty("externalId");
    expect(customer).toHaveProperty("isVerified");

    expect(customer.createdAt).toBeTruthy();
    expect(customer.updatedAt).toBeTruthy();

    if (!customer.email) expect(customer.email).toBeNull();
    else expect(typeof customer.email).toBe("string");
    if (!customer.phone) expect(customer.phone).toBeNull();
    else expect(typeof customer.phone).toBe("string");
    if (!customer.externalId) expect(customer.externalId).toBeNull();
    else expect(typeof customer.externalId).toBe("string");
  }
});
