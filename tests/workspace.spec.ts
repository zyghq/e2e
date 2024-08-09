import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const TEST_WORKSPACE_ID = process.env.TEST_WORKSPACE_ID;
const JWT = process.env.JWT;

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

// query
test("query all threads", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/`,
    {
      headers: {
        Authorization: `Bearer ${JWT}`,
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
    expect(thread).toHaveProperty("assignee");
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
// test.describe("query threads with random thread message flow", () => {
//   test.describe.configure({ mode: "serial" });
//   let randomThreadId: string;
//   let chatId: string;
//   const threads: any[] = [];
//   test("query list of threads and pick a random thread", async ({
//     request,
//   }) => {
//     const response = await request.get(
//       `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/`,
//       {
//         headers: {
//           Authorization: `Bearer ${JWT}`,
//         },
//       }
//     );

//     expect(response.status()).toBe(200);
//     const body = await response.json();
//     for (const thread of body) {
//       threads.push(thread);
//     }

//     // pullout random thread using Math.random()
//     const randomIndex = Math.floor(Math.random() * threads.length);
//     randomThreadId = threads[randomIndex].threadId;
//   });

//   test("send a member message to random thread", async ({ request }) => {
//     const message = faker.lorem.sentence();
//     const data = {
//       message: message,
//     };
//     const response = await request.post(
//       `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/${randomThreadId}/messages/`,
//       {
//         data,
//         headers: {
//           Authorization: `Bearer ${JWT}`,
//         },
//       }
//     );

//     const body = await response.json();

//     expect(response.status()).toBe(201);

//     expect(body.threadId).toBe(randomThreadId);
//     expect(body.chatId).toBeTruthy();
//     expect(body.body).toBe(message);
//     expect(body.createdAt).toBeTruthy();
//     expect(body.updatedAt).toBeTruthy();
//     expect(body.member.memberId).toBeTruthy();
//     expect(body.member.name).toBeTruthy();

//     chatId = body.chatId;
//   });

//   test("query the thread chats", async ({ request }) => {
//     const response = await request.get(
//       `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/${randomThreadId}/messages/`,
//       {
//         headers: {
//           Authorization: `Bearer ${JWT}`,
//         },
//       }
//     );

//     let hasChat = false;

//     expect(response.status()).toBe(200);
//     const body = await response.json();
//     for (const chat of body) {
//       expect(chat.threadId).toBe(randomThreadId);
//       expect(chat.chatId).toBeTruthy();
//       expect(chat.body).toBeTruthy();
//       expect(chat.createdAt).toBeTruthy();
//       expect(chat.updatedAt).toBeTruthy();

//       if (chat.member) {
//         expect(chat.member.memberId).toBeTruthy();
//         expect(chat.member.name).toBeTruthy();
//       }

//       if (chat.customer) {
//         expect(chat.customer.customerId).toBeTruthy();
//         expect(chat.customer.name).toBeTruthy();
//       }

//       if (chat.chatId === chatId) {
//         hasChat = true;
//       }
//     }
//     expect(hasChat).toBe(true);
//   });
// });

// query
test("query my assigned threads", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/with/me/`,
    {
      headers: {
        Authorization: `Bearer ${JWT}`,
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
    expect(thread).toHaveProperty("assignee");
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
      expect(thread.egressMember.memberId).toBeTruthy();
      expect(thread.egressMember.name).toBeTruthy();
      expect(thread.egressFirstSeq).toBeTruthy();
      expect(thread.egressLastSeq).toBeTruthy();
    }
  }
});

// query
test("query unassigned threads", async ({ request }) => {
  const response = await request.get(
    `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/with/unassigned/`,
    {
      headers: {
        Authorization: `Bearer ${JWT}`,
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
    expect(thread).toHaveProperty("assignee");
    expect(thread).toHaveProperty("createdAt");
    expect(thread).toHaveProperty("updatedAt");

    if (thread.ingressCustomer) {
      expect(thread.ingressCustomer.customerId).toBeTruthy();
      expect(thread.ingressCustomer.name).toBeTruthy();
      expect(thread.ingressFirstSeq).toBeTruthy();
      expect(thread.ingressLastSeq).toBeTruthy();
    }

    if (thread.egressMembers) {
      expect(thread.egressMember.memberId).toBeTruthy();
      expect(thread.egressMember.name).toBeTruthy();
      expect(thread.egressFirstSeq).toBeTruthy();
      expect(thread.egressLastSeq).toBeTruthy();
    }
  }
});

// query
test.describe("query thread labels for randomly selected thread", () => {
  test.describe.configure({ mode: "serial" });
  const threads: any[] = [];
  let randomThreadId: string;

  test("query list of threads and pick a random thread", async ({
    request,
  }) => {
    const response = await request.get(
      `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/`,
      {
        headers: {
          Authorization: `Bearer ${JWT}`,
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

  test("query thread labels for the randomly selected thread", async ({
    request,
  }) => {
    const response = await request.get(
      `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/${randomThreadId}/labels/`,
      {
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      }
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    for (const label of body) {
      expect(label.labelId).toBeTruthy();
      expect(label.name).toBeTruthy();
      expect(label.createdAt).toBeTruthy();
      expect(label.updatedAt).toBeTruthy();

      expect(label).not.toHaveProperty("workspaceId");

      const keys = Object.keys(label);
      expect(keys.length).toBe(5);
    }
  });
});

// mutation
test.describe("attach label to randomly selected thread", () => {
  test.describe.configure({ mode: "serial" });
  const threads: any[] = [];
  let randomThreadId: string;
  test("query list of threads and pick a random thread", async ({
    request,
  }) => {
    const response = await request.get(
      `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/`,
      {
        headers: {
          Authorization: `Bearer ${JWT}`,
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

  test("attach a new label to the randomly selected thread", async ({
    request,
  }) => {
    const name = faker.hacker.noun();
    const data = {
      name,
      icon: "🚀",
    };
    const response = await request.put(
      `/workspaces/${TEST_WORKSPACE_ID}/threads/chat/${randomThreadId}/labels/`,
      {
        data,
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      }
    );

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.threadLabelId).toBeTruthy();
    expect(body.threadId).toBe(randomThreadId);
    expect(body.labelId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.icon).toBe("🚀");
    expect(body.addedBy).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();

    const keys = Object.keys(body);
    expect(keys.length).toBe(8);
  });
});
