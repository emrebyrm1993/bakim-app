import { createClient } from "@supabase/supabase-js";

// Supabase bağlantı bilgilerini buraya kendi projenin değerleriyle yaz
const supabaseUrl = "https://YOUR_PROJECT_URL.supabase.co";
const supabaseKey = "YOUR_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("problemForm");
const problemList = document.getElementById("problemList");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const hat = document.getElementById("hat").value;
  const description = document.getElementById("description").value;
  const operator = document.getElementById("operator").value;
  const photoInput = document.getElementById("photo");

  let photoUrl = null;

  // Fotoğraf isteğe bağlı
  if (photoInput.files.length > 0) {
    const file = photoInput.files[0];
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("problem-photos")
      .upload(fileName, file);

    if (uploadError) {
      alert("Fotoğraf yüklenemedi: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("problem-photos")
      .getPublicUrl(fileName);

    photoUrl = data.publicUrl;
  }

  // Tabloya kayıt ekle
  const { error } = await supabase
    .from("problems")
    .insert([{ hat, description, operator, photo: photoUrl }]);

  if (error) {
    alert("Kayıt eklenemedi: " + error.message);
  } else {
    alert("Kayıt başarıyla eklendi!");
    loadProblems();
    form.reset();
  }
});

// Problem listesini yükle
async function loadProblems() {
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Liste yüklenemedi:", error.message);
    return;
  }

  problemList.innerHTML = "";
  data.forEach((p) => {
    const div = document.createElement("div");
    div.className = "problem";
    div.innerHTML = `
      <strong>Hat:</strong> ${p.hat}<br>
      <strong>Açıklama:</strong> ${p.description}<br>
      <strong>Operatör:</strong> ${p.operator}<br>
      ${p.photo ? `<img src="${p.photo}" width="150">` : ""}
    `;
    problemList.appendChild(div);
  });
}

// Sayfa açıldığında listeyi yükle
loadProblems();
