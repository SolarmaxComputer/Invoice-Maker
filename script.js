
    const itemsContainer = document.querySelector(".items");
    const addItemButton = document.getElementById("addItem");
    const totalAmountElement = document.getElementById("totalAmount");
    const exportPdfButton = document.getElementById("exportPdf");
    const companyLogoInput = document.getElementById("companyLogo");
    const settingsButton = document.getElementById("settingsButton");
	const settingsModal = document.getElementById("settingsModal");
	const closeModal = document.querySelector(".close");
	const saveSettingsButton = document.getElementById("saveSettings");
	const companyNameInput = document.getElementById("companyName");
	const companyAddressInput = document.getElementById("companyAddress");
	//const companyLogoInput = document.getElementById("companyLogo");
	const logoPreview = document.getElementById("logoPreview");
    let companyLogoUrl = null;
	
	settingsButton.addEventListener("click", () => {
    settingsModal.style.display = "block";
});

// Tutup modal saat tombol close diklik
closeModal.addEventListener("click", () => {
    settingsModal.style.display = "none";
});

// Simpan data ke localStorage dalam format XML
saveSettingsButton.addEventListener("click", () => {
    const companyName = companyNameInput.value;
    const companyAddress = companyAddressInput.value;

    if (companyName && companyAddress) {
        // Buat XML string
        const xmlString = `
            <company>
                <name>${companyName}</name>
                <address>${companyAddress}</address>
            </company>
        `;

        // Simpan ke localStorage
        localStorage.setItem("companySettings", xmlString);
        alert("Pengaturan berhasil disimpan!");
        settingsModal.style.display = "none";
    } else {
        alert("Nama dan alamat perusahaan harus diisi!");
    }
});

// Muat data dari localStorage saat halaman dimuat
window.addEventListener("load", () => {
    const xmlString = localStorage.getItem("companySettings");
	loadLogoFromLocalStorage();
    if (xmlString) {
        // Parse XML string
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // Ambil data dari XML
        const companyName = xmlDoc.querySelector("name").textContent;
        const companyAddress = xmlDoc.querySelector("address").textContent;

        // Isi input dengan data yang ada
        companyNameInput.value = companyName;
        companyAddressInput.value = companyAddress;
		companyNameLabel.textContent = companyName;
        companyAddressLabel.textContent = companyAddress;
    }
});
   // Event listener untuk upload logo
companyLogoInput.addEventListener("change", (event) => {
   const file = event.target.files[0];
    if (file) {
        saveLogoToLocalStorage(file);
    }
});

// Fungsi untuk menyimpan logo ke localStorage
function saveLogoToLocalStorage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Image = e.target.result; // Konversi ke Base64
        localStorage.setItem("companyLogo", base64Image); // Simpan ke localStorage
        logoPreview.src = base64Image; // Tampilkan logo
        logoPreview.style.display = "block";
    };
    reader.readAsDataURL(file); // Baca file sebagai Data URL
}

// Fungsi untuk memuat logo dari localStorage
function loadLogoFromLocalStorage() {
    const savedLogo = localStorage.getItem("companyLogo");
    if (savedLogo) {
        logoPreview.src = savedLogo; // Tampilkan logo
        logoPreview.style.display = "block";
    }
}
	
    // Fungsi untuk menghitung total harga per item
    function updateItemTotal(item) {
        const quantityInput = item.querySelector(".item-quantity");
        const priceInput = item.querySelector(".item-price");
        const totalElement = item.querySelector(".item-total");

        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value.replace(/\./g, '')) || 0; // Hapus thousand separator (titik)
        const total = quantity * price;
        totalElement.textContent = formatNumber(total); // Update total harga item
        calculateTotal(); // Update total keseluruhan
    }

    // Fungsi untuk menghitung total keseluruhan
    function calculateTotal() {
        let total = 0;
        document.querySelectorAll(".item").forEach(item => {
            const itemTotal = parseFloat(item.querySelector(".item-total").textContent.replace(/\./g, '')) || 0; // Hapus thousand separator (titik)
            total += itemTotal;
        });
        totalAmountElement.textContent = formatNumber(total); // Format total tanpa desimal
    }

    // Format number dengan thousand separator Indonesia (titik)
    function formatNumber(num) {
        return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(num);
    }
  
    

    // Muat data dari localStorage saat halaman dimuat (opsional)
    const savedCompanyName = localStorage.getItem("companyName");
    const savedCompanyAddress = localStorage.getItem("companyAddress");
    if (savedCompanyName) {
        document.getElementById("companyName").value = savedCompanyName;
    }
    if (savedCompanyAddress) {
        document.getElementById("companyAddress").value = savedCompanyAddress;
    }

    // Tambahkan item baru
    addItemButton.addEventListener("click", function () {
        const newItem = document.createElement("div");
        newItem.classList.add("item");
        newItem.innerHTML = `
            <input type="text" class="item-name" placeholder="Nama item">
            <input type="number" class="item-quantity" placeholder="Qty">
            <input type="number" class="item-price" placeholder="Harga">
            <span class="item-total">0</span>
            <button class="remove-item">Hapus</button>
        `;
        itemsContainer.appendChild(newItem);

        // Pasang event listener untuk menghapus item
        newItem.querySelector(".remove-item").addEventListener("click", function () {
			//const itemDiv = button.parentElement;
            itemsContainer.removeChild(newItem);
			//itemsList.removeChild(itemDiv); // Hapus item dari daftar
            calculateTotal();
        });

        // Pasang event listener untuk update total harga
        const quantityInput = newItem.querySelector(".item-quantity");
        const priceInput = newItem.querySelector(".item-price");

        quantityInput.addEventListener("input", () => updateItemTotal(newItem));
        priceInput.addEventListener("input", () => updateItemTotal(newItem));
    });
// Pasang event listener untuk item yang sudah ada sebelumnya
document.querySelectorAll(".remove-item").forEach(button => {
    button.addEventListener("click", function () {
        const itemDiv = button.closest(".item"); // Ambil elemen item terdekat
        itemsContainer.removeChild(itemDiv); // Hapus item dari daftar
        calculateTotal(); // Perbarui total setelah menghapus item
    });
});
    // Pasang event listener untuk input pertama (jika ada)
    const firstItem = document.querySelector(".item");
    if (firstItem) {
        const quantityInput = firstItem.querySelector(".item-quantity");
        const priceInput = firstItem.querySelector(".item-price");

        quantityInput.addEventListener("input", () => updateItemTotal(firstItem));
        priceInput.addEventListener("input", () => updateItemTotal(firstItem));
    }

    // Ekspor ke PDF
    exportPdfButton.addEventListener("click", function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
		const logoBase64 = localStorage.getItem("companyLogo");
        // Tambahkan logo perusahaan (jika ada)
        // Tambahkan logo ke PDF (jika ada)
		if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 0, 0, 30, 30); // Format: (base64, format, x, y, width, height)
		}


        // Tambahkan detail invoice
        const invoiceNumber = document.getElementById("invoiceNumber").value;
        const invoiceDate = document.getElementById("invoiceDate").value;
        const dueDate = document.getElementById("dueDate").value;
        const customerName = document.getElementById("customerName").value;
		const companyName = document.getElementById("companyName").value;
		const companyAddress = document.getElementById("companyAddress").value;
		doc.setFontSize(20);
		doc.text(companyName,40,10);
		doc.setFontSize(12);
		doc.text(companyAddress,40,18);
		doc.line(3,28,doc.internal.pageSize.width-5,28);
        doc.setFontSize(22);
		const invoiceWidth = doc.getTextWidth("Invoice");
        doc.text("Invoice", doc.internal.pageSize.width - invoiceWidth - 10, 10); // Sesuaikan posisi
        doc.setFontSize(10);

        // Nama Pelanggan di sebelah kiri
        doc.text(`Kepada Yth: ${customerName}`, 10, 35);

        // Tanggal Invoice di sebelah kanan
        const invoiceDateText = `Tanggal Invoice: ${invoiceDate}`;
        const invoiceDateWidth = doc.getTextWidth(invoiceDateText);
        doc.text(invoiceDateText, doc.internal.pageSize.width - invoiceDateWidth - 10, 40); // Posisi kanan

        // Nomor Invoice dan Jatuh Tempo
        doc.text(`Nomor Invoice: ${invoiceNumber}`, doc.internal.pageSize.width - invoiceDateWidth - 10, 35);
        doc.text(`Jatuh Tempo: ${dueDate}`, doc.internal.pageSize.width - invoiceDateWidth - 10, 45);
doc.line(3,50,doc.internal.pageSize.width-5,50);
        // Siapkan data untuk tabel
        const items = [];
        document.querySelectorAll(".item").forEach(item => {
            const name = item.querySelector(".item-name").value;
            const quantity = item.querySelector(".item-quantity").value;
            const price = formatNumber(item.querySelector(".item-price").value); // Format harga tanpa desimal
            const total = item.querySelector(".item-total").textContent; // Ambil total harga item
            items.push([name, quantity, price, total]);
        });
const pageWidth = doc.internal.pageSize.getWidth();
const tableWidth = pageWidth - 2 * 5;
        // Tambahkan tabel menggunakan autoTable
        doc.autoTable({
            startY: 52, // Mulai tabel di bawah detail invoice
			margin: { left: 5, right: 5},
            head: [['Item', 'Qty', 'Harga', 'Total']],
            body: items,
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [22, 160, 133] },
            columnStyles: {
                0: { cellWidth: tableWidth * 0.5 },
                1: { cellWidth: tableWidth * 0.1 },
                2: { cellWidth: tableWidth * 0.2, halign: "right" },
                3: { cellWidth: tableWidth * 0.2, halign: "right" }
            }
        });

        // Tambahkan total amount
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Total : ${formatNumber(totalAmountElement.textContent.replace(/\./g, ''))}`, pageWidth - 50, finalY);

        // Simpan PDF
        doc.save("invoice.pdf");
    });
