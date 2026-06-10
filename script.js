// script.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

// Supabase Project URL ve Anon Key'i buraya yaz
const supabaseUrl = "https://SENIN-PROJE-URL.supabase.co"
const supabaseKey = "SENIN-ANON-KEY"
const supabase = createClient(supabaseUrl, supabaseKey)

// Problem ekleme
document.getElementById("problemForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const hat = document.getElementById("hat").value
  const description = document.getElementById("description").value
  const operator = document.getElementById("operator").value
  const photoFile = document.getElementById("photo").files[0]

  let photoUrl = null

  // Fotoğraf yükleme
  if (photoFile) {
    const { data, error } = await supabase.storage
      .from("problem-photos")
      .upload(Date.now() + "_" + photoFile.name, photoFile)

    if (error) {
      console.error("Fotoğraf yüklenemedi:", error.message)
    } else {
      photoUrl = supabase.storage.from("problem-photos").getPublicUrl(data.path).data.publicUrl
    }
  }

  // Tabloya kayıt ekleme
  const { error } = await supabase
    .from("problems")
    .insert([{ hat, description, operator_name: operator, photo_url: photoUrl, status: "open" }])

  if (error) {
    alert("Kayıt eklenemedi: " + error.message)
  } else {
    alert("Problem başarıyla eklendi!")
    listProblems()
  }
})

// Problem listeleme
async function listProblems() {
  const { data, error } = await supabase.from("problems").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Listeleme hatası:", error.message)
    return
  }

  const listDiv = document.getElementById("problemList")
  listDiv.innerHTML = ""

  data.forEach((p) => {
    const div = document.createElement("div")
    div.className = "problem" + (p.status === "done" ? " done" : "")
    div.innerHTML = `
      <strong>Hat:</strong> ${p.hat}<br>
      <strong>Açıklama:</strong> ${p.description}<br>
      <strong>Operatör:</strong> ${p.operator_name}<br>
      ${p.photo_url ? `<img src="${p.photo_url}" width="150">` : ""}
      <br><button onclick="markDone(${p.id})">Tamamlandı</button>
    `
    listDiv.appendChild(div)
  })
}

// Problem tamamlandı işaretleme
async function markDone(id) {
  const { error } = await supabase.from("problems").update({ status: "done", closed_at: new Date() }).eq("id", id)
  if (error) {
    alert("Güncelleme hatası: " + error.message)
  } else {
    listProblems()
  }
}

// Sayfa açıldığında listeyi yükle
listProblems()
