'use server'; // mark all the exported functions within the file as server functions.

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache'; // import the revalidatePath function from the next/cache module.
import { redirect } from 'next/navigation'; // import the redirect function from the next/navigation module.

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

// create a new async function that accepts formData
export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    const amountInCents = amount * 100; // It's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const date = new Date().toISOString().split('T')[0]; // get the current date and format it as a string in YYYY-MM-DD format.

    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `; // insert the invoice into the database.

    revalidatePath('/dashboard/invoices'); // clear this cache and trigger a new request to the server. 

    redirect('/dashboard/invoices'); // redirect the user to the invoices page.

}



