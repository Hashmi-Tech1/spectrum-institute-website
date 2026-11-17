/* ============================================================
   SUPABASE SETUP — Admission Form → SQL Database Connection
   ============================================================
   Follow these steps once, then this file will save every
   admission form submission into a real SQL (Postgres) table.

   1. Go to https://supabase.com and sign up (free tier is enough).
   2. Click "New project" → give it a name and a database password
      (save that password somewhere safe) → create it.
   3. Once the project is ready, open the "SQL Editor" (left sidebar)
      and run this to create the table (copy-paste, then click "Run"):

      create table admissions (
        id bigint generated always as identity primary key,
        full_name text,
        father_name text,
        dob date,
        gender text,
        email text,
        phone text,
        address text,
        guardian_name text,
        guardian_phone text,
        guardian_relation text,
        course text,
        shift text,
        submitted_at timestamptz default now()
      );

      alter table admissions enable row level security;

      create policy "Allow public inserts"
      on admissions for insert
      to anon
      with check (true);

      -- No policy for select/update/delete is added on purpose,
      -- so nobody can read, edit or delete rows from the public website.

   4. In the left sidebar go to Project Settings → API.
      Copy the "Project URL" and the "anon public" API key.
   5. Paste both values into the placeholders below.
   6. Save this file and re-upload your website — done, no coding needed after this.
   ============================================================ */

const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY";

// True only after you have replaced BOTH placeholders above with your real values.
const supabaseConfigured =
    !SUPABASE_URL.includes('PASTE_') &&
    !SUPABASE_ANON_KEY.includes('PASTE_') &&
    /^https?:\/\//.test(SUPABASE_URL);

// Create the client safely. A bad URL/key (or the Supabase script failing to load)
// must NOT crash this file, otherwise the save function below would never exist.
let supabaseClient = null;
if (supabaseConfigured) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
        console.error('Supabase could not start (check your internet connection and your URL/key):', err);
    }
} else {
    console.warn('Supabase is not configured yet: open supabase-config.js and paste your Project URL and anon public key.');
}

// script.js calls this function automatically when someone finishes the admission form.
// It inserts one row per application into the "admissions" table.
// If the database is not ready it THROWS, so the form shows an error instead of a fake "success".
window.saveAdmissionToDatabase = async function (formData) {
    if (!supabaseClient) {
        const notReady = new Error('DATABASE_NOT_CONFIGURED');
        notReady.code = 'DATABASE_NOT_CONFIGURED';
        throw notReady;
    }
    const { error } = await supabaseClient.from('admissions').insert([
        {
            full_name: formData.fullName,
            father_name: formData.fatherName,
            dob: formData.dob || null,
            gender: formData.gender,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            guardian_name: formData.guardianName,
            guardian_phone: formData.guardianPhone,
            guardian_relation: formData.guardianRelation,
            course: formData.course,
            shift: formData.shift
        }
    ]);
    if (error) throw error;
};

/* ------------------------------------------------------------
   CONTACT PAGE MESSAGES  →  "contact_messages" table
   Run this once in the Supabase SQL Editor:

      create table contact_messages (
        id bigint generated always as identity primary key,
        full_name text,
        email text,
        course text,
        message text,
        submitted_at timestamptz default now()
      );

      alter table contact_messages enable row level security;

      create policy "Allow public inserts"
      on contact_messages for insert
      to anon
      with check (true);
   ------------------------------------------------------------ */
window.saveContactMessage = async function (data) {
    if (!supabaseClient) {
        const notReady = new Error('DATABASE_NOT_CONFIGURED');
        notReady.code = 'DATABASE_NOT_CONFIGURED';
        throw notReady;
    }
    const { error } = await supabaseClient.from('contact_messages').insert([
        {
            full_name: data.fullName,
            email: data.email,
            course: data.course,
            message: data.message
        }
    ]);
    if (error) throw error;
};

/* ============================================================
   To view submissions later: Supabase dashboard → Table Editor →
   "admissions" table. Every application shows up as a row there,
   exportable to CSV with one click.
   ============================================================ */
