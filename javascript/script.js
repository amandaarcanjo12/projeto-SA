document.addEventListener("DOMContentLoaded", function () {

    // ===============================
    // CADASTRO
    // ===============================
    const formCadastro = document.getElementById("formCadastro");
    const areaAcompanhar = document.getElementById("areaAcompanhar");

    if (formCadastro && areaAcompanhar) {
        const inputsCadastro = formCadastro.querySelectorAll("input");

        function verificarCamposCadastro() {
            let todosPreenchidos = Array.from(inputsCadastro).every(i => i.value.trim() !== "");
            areaAcompanhar.style.display = todosPreenchidos ? "block" : "none";
        }

        inputsCadastro.forEach(input => input.addEventListener("input", verificarCamposCadastro));
    }


    // ===============================
    // AUTOCOMPLETE BAIRROS
    // ===============================
    const bairrosFlorianopolis = [
        "Abraão", "Agronômica", "Armação", "Balneário", "Barra da Lagoa",
        "Cacupé", "Cachoeira do Bom Jesus", "Campeche", "Canasvieiras",
        "Canto da Lagoa", "Capoeiras", "Carianos", "Centro",
        "Coqueiros", "Costa da Lagoa", "Costeira do Pirajubaé",
        "Estreito", "Ingleses do Rio Vermelho", "Itacorubi",
        "João Paulo", "Jurerê", "Jurerê Internacional",
        "Lagoa da Conceição", "Monte Cristo", "Pantanal",
        "Pântano do Sul", "Ratones", "Ribeirão da Ilha",
        "Rio Tavares", "Saco dos Limões", "Sambaqui",
        "Santinho", "Santo Antônio de Lisboa", "Trindade"
    ];

    const inputLocal = document.getElementById("local");
    const sugestoesBox = document.getElementById("sugestoes-bairros");

    if (inputLocal && sugestoesBox) {
        inputLocal.addEventListener("input", function () {
            const valor = inputLocal.value.toLowerCase();
            sugestoesBox.innerHTML = "";

            if (valor.length > 1) {
                const filtrados = bairrosFlorianopolis.filter(b => b.toLowerCase().includes(valor));
                filtrados.forEach(bairro => {
                    const div = document.createElement("div");
                    div.classList.add("item-sugestao");
                    div.textContent = bairro;
                    div.onclick = function () {
                        inputLocal.value = bairro;
                        sugestoesBox.innerHTML = "";
                    };
                    sugestoesBox.appendChild(div);
                });
            }
        });

        document.addEventListener("click", function(e) {
            if (!inputLocal.contains(e.target) && !sugestoesBox.contains(e.target)) {
                sugestoesBox.innerHTML = "";
            }
        });
    }


    // ===============================
    // FORMULÁRIO DE DENÚNCIA
    // ===============================
    const formDenuncia = document.getElementById("formDenuncia");
    const msg = document.getElementById("msg");

    if (formDenuncia && msg) {

        function gerarStatusAleatorio() {
            const status = ["Pendente", "Em análise", "Resolvido"];
            return status[Math.floor(Math.random() * status.length)];
        }

        formDenuncia.addEventListener("submit", function (e) {
            e.preventDefault();

            const titulo    = document.getElementById("titulo").value.trim();
            const descricao = document.getElementById("descricao").value.trim();
            const local     = document.getElementById("local").value.trim();
            const categoria = document.getElementById("categoria").value;

            if (!titulo || !descricao || !local || !categoria) {
                msg.innerHTML = `
                    <div class="alerta-erro">
                        <i class="fa fa-triangle-exclamation" style="margin-right:8px"></i>
                        Preencha todos os campos antes de enviar.
                    </div>
                `;
                return;
            }

            const status = gerarStatusAleatorio();
            let lista = JSON.parse(localStorage.getItem("denuncias")) || [];

            lista.push({ titulo, descricao, local, categoria, status, data: new Date().toLocaleDateString("pt-BR") });
            localStorage.setItem("denuncias", JSON.stringify(lista));

            msg.innerHTML = `
                <div class="alerta-sucesso">
                    <i class="fa fa-circle-check" style="font-size:22px;display:block;margin-bottom:8px"></i>
                    Denúncia enviada com sucesso!<br>
                    <a href="acompanhamento.html" class="btn btn-acompanhar" style="margin-top:14px;width:auto;padding:10px 24px;display:inline-flex;gap:8px;align-items:center;">
                        <i class="fa fa-list"></i> Acompanhar denúncia
                    </a>
                </div>
            `;

            formDenuncia.reset();
            if (sugestoesBox) sugestoesBox.innerHTML = "";
        });
    }


    // ===============================
    // LISTAR DENÚNCIAS (ACOMPANHAMENTO)
    // ===============================
    const listaEl    = document.getElementById("listaDenuncias");
    const filtroCateg = document.getElementById("filtroCategoria");
    const filtroStatus = document.getElementById("filtroStatus");

    if (listaEl) {

        function statusClass(s) {
            if (!s) return "";
            const m = s.toLowerCase();
            if (m.includes("pendente"))  return "pendente";
            if (m.includes("análise") || m.includes("analise")) return "em-analise";
            if (m.includes("resolv"))   return "resolvida";
            return "";
        }

        function renderLista() {
            const lista = JSON.parse(localStorage.getItem("denuncias")) || [];
            const catFiltro    = filtroCateg  ? filtroCateg.value  : "";
            const statusFiltro = filtroStatus ? filtroStatus.value : "";

            const filtrada = lista.filter(item => {
                const okCat    = !catFiltro    || item.categoria === catFiltro;
                const okStatus = !statusFiltro || item.status    === statusFiltro;
                return okCat && okStatus;
            });

            listaEl.innerHTML = "";

            if (filtrada.length === 0) {
                listaEl.innerHTML = `
                    <li style="text-align:center;border-left:none;color:var(--muted);padding:40px 20px;background:none;box-shadow:none;">
                        <i class="fa fa-inbox" style="font-size:36px;display:block;margin-bottom:12px;opacity:.4"></i>
                        Nenhuma denúncia encontrada.
                    </li>
                `;
                return;
            }

            filtrada.slice().reverse().forEach(item => {
                let li = document.createElement("li");
                const sc = statusClass(item.status);
                li.innerHTML = `
                    <strong>${item.titulo}</strong>
                    <p style="color:var(--muted);font-size:14px;margin:6px 0 12px;line-height:1.5">${item.descricao}</p>
                    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:13px;color:var(--muted);">
                        <span><i class="fa fa-location-dot" style="margin-right:5px;color:var(--blue)"></i>${item.local}</span>
                        <span><i class="fa fa-tag" style="margin-right:5px;color:var(--blue)"></i>${item.categoria}</span>
                        <span><i class="fa fa-calendar" style="margin-right:5px;color:var(--blue)"></i>${item.data}</span>
                        <span class="status ${sc}">${item.status}</span>
                    </div>
                `;
                listaEl.appendChild(li);
            });
        }

        renderLista();

        if (filtroCateg)  filtroCateg.addEventListener("change",  renderLista);
        if (filtroStatus) filtroStatus.addEventListener("change", renderLista);
    }

});
