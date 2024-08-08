import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { describe } from "node:test";

const baseUrl = process.env.ZYG_XSRV_URL;
const TEST_WORKSPACE_ID = process.env.TEST_WORKSPACE_ID;
const TEST_WIDGET_ID = process.env.TEST_WIDGET_ID;
const TEST_CUSTOMER_JWT = process.env.TEST_CUSTOMER_JWT;

// mutation
test.describe("mutation create verified customer by email and hash", () => {
  test.describe.configure({ mode: "serial" });
  const customerHash =
    "97389dc07ad04ffb58b560f80eab1cf4f9f500c6199c16deab5f90abc9b17872";
  const email = "Alexys52@gmail.com";
  test("init widget with customer", async ({ request }) => {
    const data = {
      customerEmail: email,
      customerHash: customerHash,
    };
    const response = await request.post(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/init/`,
      { data }
    );
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.jwt).toBeTruthy();
    expect(body.isVerified).toBe(true);
    expect(body.name).toBeTruthy();
    expect(body.email).toBe(email);
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

// mutation
describe("mutation create customer thread", () => {
  test.describe.configure({ mode: "serial" });
  test("create start customer thread", async ({ request }) => {
    const message = faker.lorem.sentence();
    const data = {
      message,
    };
    const response = await request.post(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/threads/chat/`,
      {
        data,
        headers: {
          Authorization: `Bearer ${TEST_CUSTOMER_JWT}`,
        },
      }
    );

    const body = await response.json();
    expect(response.status()).toBe(201);
    expect(body.threadId).toBeTruthy();
    expect(body.customer.customerId).toBeTruthy();
    expect(body.customer.name).toBeTruthy();
    expect(body).toHaveProperty("title");
    expect(body).toHaveProperty("description");
    expect(body).toHaveProperty("sequence");
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("read");
    expect(body).toHaveProperty("replied");
    expect(body).toHaveProperty("priority");
    expect(body).toHaveProperty("spam");
    expect(body).toHaveProperty("channel");
    expect(body).toHaveProperty("previewText");
    expect(body).toHaveProperty("ingressCustomer");
    expect(body.ingressCustomer.customerId).toBeTruthy();
    expect(body.ingressCustomer.name).toBeTruthy();
    expect(body).toHaveProperty("createdAt");
    expect(body).toHaveProperty("updatedAt");
    expect(body).toHaveProperty("chat");
    expect(body.chat).toHaveProperty("threadId");
    expect(body.chat).toHaveProperty("chatId");
    expect(body.chat).toHaveProperty("body");
    expect(body.chat).toHaveProperty("sequence");
    expect(body.chat).toHaveProperty("customer");
    expect(body.chat).toHaveProperty("createdAt");
    expect(body.chat).toHaveProperty("updatedAt");
    expect(body.chat.isHead).toBe(true);
    expect(body.chat.customer.customerId).toBeTruthy();
    expect(body.chat.customer.name).toBeTruthy();
    expect(body.ingressFirstSeq).toBeTruthy();
    expect(body.ingressLastSeq).toBeTruthy();
  });
});

test("query customer threads", async ({ request }) => {
  const response = await request.get(
    `${baseUrl}/widgets/${TEST_WIDGET_ID}/threads/chat/`,
    {
      headers: {
        Authorization: `Bearer ${TEST_CUSTOMER_JWT}`,
      },
    }
  );

  expect(response.status()).toBe(200);
  const body = await response.json();
  for (const thread of body) {
    expect(thread.threadId).toBeTruthy();
    expect(thread.customer.customerId).toBeTruthy();
    expect(thread.customer.name).toBeTruthy();
    expect(thread).toHaveProperty("title");
    expect(thread).toHaveProperty("description");
    expect(thread).toHaveProperty("sequence");
    expect(thread).toHaveProperty("status");
    expect(thread).toHaveProperty("read");
    expect(thread).toHaveProperty("replied");
    expect(thread).toHaveProperty("priority");
    expect(thread).toHaveProperty("spam");
    expect(thread).toHaveProperty("channel");
    expect(thread).toHaveProperty("previewText");
    expect(thread).toHaveProperty("ingressCustomer");
    expect(thread).toHaveProperty("createdAt");
    expect(thread).toHaveProperty("updatedAt");

    if (thread.ingressCustomer) {
      expect(thread.ingressCustomer.customerId).toBeTruthy();
      expect(thread.ingressCustomer.name).toBeTruthy();
      expect(thread.ingressFirstSeq).toBeTruthy();
      expect(thread.ingressLastSeq).toBeTruthy();
    }

    if (thread.egressMembers) {
      expect(thread.egresssMember.memberId).toBeTruthy();
      expect(thread.egresssMember.name).toBeTruthy();
      expect(thread.egressFirstSeq).toBeTruthy();
      expect(thread.egressLastSeq).toBeTruthy();
    }
  }
});

// mutation
test.describe("customer threads with random thread message flow", () => {
  test.describe.configure({ mode: "serial" });
  let randomThreadId: string;
  let chatId: string;
  const threads: any[] = [];
  test("query list of customer threads and pick a random thread", async ({
    request,
  }) => {
    const response = await request.get(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/threads/chat/`,
      {
        headers: {
          Authorization: `Bearer ${TEST_CUSTOMER_JWT}`,
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    for (const thread of body) {
      threads.push(thread);
    }

    // pullout random thread using Math.random()
    const randomIndex = Math.floor(Math.random() * threads.length);
    randomThreadId = threads[randomIndex].threadId;
  });

  test("send a message to the random thread", async ({ request }) => {
    const message = faker.lorem.sentence();
    const data = {
      message: message,
    };
    const response = await request.post(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/threads/chat/${randomThreadId}/messages/`,
      {
        data,
        headers: {
          Authorization: `Bearer ${TEST_CUSTOMER_JWT}`,
        },
      }
    );

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.threadId).toBeTruthy();
    expect(body.chatId).toBeTruthy();
    expect(body.body).toBeTruthy();
    expect(body.sequence).toBeTruthy();
    expect(body.isHead).toBe(false);
    expect(body.customer.customerId).toBeTruthy();
    expect(body.customer.name).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
    chatId = body.chatId;
  });

  test("make sure thread with latest message is at the top", async ({
    request,
  }) => {
    const response = await request.get(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/threads/chat/`,
      {
        headers: {
          Authorization: `Bearer ${TEST_CUSTOMER_JWT}`,
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    const thread = body[0];
    expect(thread.threadId).toBe(randomThreadId);
  });

  test("query list of thread messages", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/widgets/${TEST_WIDGET_ID}/threads/chat/${randomThreadId}/messages/`,
      {
        headers: {
          Authorization: `Bearer ${TEST_CUSTOMER_JWT}`,
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    let hasChat = false;

    for (const message of body) {
      expect(message.threadId).toBeTruthy();
      expect(message.chatId).toBeTruthy();
      expect(message.body).toBeTruthy();
      expect(message.sequence).toBeTruthy();
      expect(message).toHaveProperty("isHead");
      expect(message.customer.customerId).toBeTruthy();
      expect(message.customer.name).toBeTruthy();
      expect(message.createdAt).toBeTruthy();
      expect(message.updatedAt).toBeTruthy();

      if (message.chatId === chatId) {
        hasChat = true;
      }
    }

    expect(hasChat).toBe(true);
  });
});
