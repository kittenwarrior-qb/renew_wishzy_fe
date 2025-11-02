import { test } from '@playwright/test';

test.describe('Counter', () => {
  test.describe('API validation', () => {
    // TODO: Update these tests to use NestJS backend API URL when backend is ready
    // For now, these tests are disabled as frontend API routes have been removed
    // test('shouldn\'t increment the counter with an invalid input', async ({ page }) => {
    //   const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    //   const counter = await page.request.put(`${apiUrl}/counter`, {
    //     data: {
    //       increment: 'incorrect',
    //     },
    //   });
    //
    //   expect(counter.status()).toBe(422);
    // });
    //
    // test('shouldn\'t increment the counter with a negative number', async ({ page }) => {
    //   const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    //   const counter = await page.request.put(`${apiUrl}/counter`, {
    //     data: {
    //       increment: -1,
    //     },
    //   });
    //
    //   expect(counter.status()).toBe(422);
    // });
    //
    // test('shouldn\'t increment the counter with a number greater than 3', async ({ page }) => {
    //   const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    //   const counter = await page.request.put(`${apiUrl}/counter`, {
    //     data: {
    //       increment: 5,
    //     },
    //   });
    //
    //   expect(counter.status()).toBe(422);
    // });

    // TODO: Enable this test after connecting to your NestJS backend
    // test('should increment the counter and update the counter correctly', async ({ page }) => {
    //   // `x-e2e-random-id` is used for end-to-end testing to make isolated requests
    //   // The default value is 0 when there is no `x-e2e-random-id` header
    //   const e2eRandomId = faker.number.int({ max: 1000000 });
    //
    //   let counter = await page.request.put('/api/counter', {
    //     data: {
    //       increment: 1,
    //     },
    //     headers: {
    //       'x-e2e-random-id': e2eRandomId.toString(),
    //     },
    //   });
    //   let counterJson = await counter.json();
    //
    //   expect(counter.status()).toBe(200);
    //
    //   // Save the current count
    //   const count = counterJson.count;
    //
    //   counter = await page.request.put('/api/counter', {
    //     data: {
    //       increment: 2,
    //     },
    //     headers: {
    //       'x-e2e-random-id': e2eRandomId.toString(),
    //     },
    //   });
    //   counterJson = await counter.json();
    //
    //   expect(counter.status()).toBe(200);
    //   expect(counterJson.count).toEqual(count + 2);
    //
    //   counter = await page.request.put('/api/counter', {
    //     data: {
    //       increment: 1,
    //     },
    //     headers: {
    //       'x-e2e-random-id': e2eRandomId.toString(),
    //     },
    //   });
    //   counterJson = await counter.json();
    //
    //   expect(counter.status()).toBe(200);
    //   expect(counterJson.count).toEqual(count + 3);
    // });
  });
});
