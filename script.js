import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "YOUR_PROJECT_URL";
const supabaseKey = "YOUR_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("problemForm");
const problemList = document.getElementById("problemList");

// Sayfa yüklendiğinde listeyi getir
document.addEventListener("DOMContentLoaded", loadProblems);

// Form gönderimini yönet
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const hat = document.getElementById("hat").value;
  const description = document.getElementById("description").value;
  const operator_name = document.getElementById("operator").value;
  const photoInput = document.getElementById("photo");

  let photo_url = null;

  // Fotoğraf yükleme işlemi
  if (photoInput.files.length > 0) {
    const file = photoInput.files[0];
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("problem-photos")
      .upload(fileName, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("problem-photos").getPublicUrl(fileName);
      photo_url = data.publicUrl;
    } else {
      console.error("Fotoğraf yüklenemedi:", uploadError.message);
    }
  }

  // Veritabanına kayıt
  const { error } = await supabase.from("problems").insert([
    { hat, description, operator_name, photo_url, status: "open" }
  ]);

  if (error) {
    alert("Kayıt eklenemedi: " + error.message);
  } else {
    alert("Kayıt başarıyla eklendi!");
    form.reset();
    loadProblems(); // Listeyi güncelle
  }
});

// Verileri listeleme fonksiyonu
async function loadProblems() {
  if (!problemList) return;

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Liste yüklenemedi:", error.message);
    return;
  }

  problemList.innerHTML = ""; // Listeyi temizle

  data.forEach((p) => {
    const div = document.createElement("div");
    div.className = "problem" + (p.status === "done" ? " done" : "");
    div.innerHTML = `
      <div>
        <strong>Hat:</strong> ${p.hat}<br>
        <strong>Açıklama:</strong> ${p.description}<br>
        <strong>Operatör:</strong> ${p.operator_name}<br>
        ${p.photo_url ? `<img src="${p.photo_url}" width="100" style="display:block; margin-top:10px;">` : ""}
      </div>
      <div class="actions">
        <button class="approve">Onay</button>
        <button class="delete">Sil</button>
      </div>
    `;

    // Onay aksiyonu
    div.querySelector(".approve").addEventListener("click", async () => {
      await supabase.from("problems").update({ status: "done" }).eq("id", p.id);
      loadProblems();
    });

    // Silme aksiyonu
    div.querySelector(".delete").addEventListener("click", async () => {
      await supabase.from("problems").delete().eq("id", p.id);
      loadProblems();
    });

    problemList.appendChild(div);
  });
}
