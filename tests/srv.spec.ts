import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const TEST_WORKSPACE_ID = process.env.TEST_WORKSPACE_ID;

test("server ok", async ({ request }) => {
  const response = await request.get("/");
  const text = await response.text();
  expect(response.ok()).toBeTruthy();
  expect(text).toBe("ok");
});

test("fetch list of workspaces", async ({ request }) => {
  const response = await request.get("/workspaces/");

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  let hasTestWorkspace = false;

  for (const workspace of body) {
    if (workspace.workspaceId === TEST_WORKSPACE_ID) hasTestWorkspace = true;
    expect(workspace.workspaceId).toBeTruthy();
    expect(workspace.name).toBeTruthy();
    expect(workspace.createdAt).toBeTruthy();
    expect(workspace.updatedAt).toBeTruthy();
  }
  expect(hasTestWorkspace).toBeTruthy();
});

test("create workspace with the primary member", async ({ request }) => {
  // generate awesome faker workspace name
  const genWorkspaceName = faker.commerce.department() + " " + "Space";
  const data = {
    name: genWorkspaceName,
  };

  // make sure we make request to our server
  const workspaceResponse = await request.post("/workspaces/", {
    data,
  });

  expect(workspaceResponse.ok()).toBeTruthy();
  expect(workspaceResponse.status()).toBe(201);

  const workspaceRespBody = await workspaceResponse.json();
  expect(workspaceRespBody.workspaceId).toBeTruthy();
  expect(workspaceRespBody.name).toBe(genWorkspaceName); // make sure we got the name we sent
  expect(workspaceRespBody.createdAt).toBeTruthy();
  expect(workspaceRespBody.updatedAt).toBeTruthy();

  // make sure we have a primary member
  const primaryMemberResponse = await request.get(
    `/workspaces/${workspaceRespBody.workspaceId}/members/me/`
  );
  expect(primaryMemberResponse.ok()).toBeTruthy();
  expect(primaryMemberResponse.status()).toBe(200);

  const primaryMemberBody = await primaryMemberResponse.json();
  expect(primaryMemberBody.memberId).toBeTruthy();
  expect(primaryMemberBody.name).toBeTruthy();
  expect(primaryMemberBody.role).toBeTruthy();
  expect(primaryMemberBody.createdAt).toBeTruthy();
  expect(primaryMemberBody.updatedAt).toBeTruthy();

  // make sure the member is a primary member
  expect(primaryMemberBody.role).toBe("primary");
});

test("fetch my workspace membership", async ({ request }) => {
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
