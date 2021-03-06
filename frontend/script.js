const secondaRiga = document.getElementById('secondaRiga');
const ricercaAvanzata = document.getElementById('ricercaAvanzata');
const tableBody = document.getElementById('table-body');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const btnReset = document.getElementById('reset');

function Overlay() {
    this.velo = document.getElementById('velo');
    this.loaded = null;

    this.prenotazione = (id) => {
        console.log(id);
        this.loaded = document.getElementById('overlay_prenotazione');

        const prenotazione_form = document.getElementById('prenotazione-form');
        console.log(prenotazione_form);
        prenotazione_form.onsubmit = () => {
            try {
                let nome = prenotazione_form[0].value;
                let cognome = prenotazione_form[1].value;
                let email = prenotazione_form[2].value;
                let ok = false;
                $.ajax({
                    type: "POST",
                    url: "./backend/admin_api.php/prenotazione",
                    data: {"idfilm":id,nome, cognome, email}
                }).done((data) => {
                    console.log(data);
                    let response = JSON.parse(data);
                    if (response.ok && response.ok === "true") {
                        ok = true;
                        console.info("Ok!");
                    }
                }).fail((errore) => {
                    console.log(errore);
                }).always(() => {
                    if (ok) {
                        this.hide();
                        request_dvd();
                    } else {
                        alert("Login Errato!");
                    }
                });
            } catch (e) {

            }
            return false;
        };

        return this;
    };

    this.schedafilm = (params) => {
        console.log(params);
        this.loaded = document.getElementById('overlay_schedafilm');
        document.getElementById('scheda-titolo').innerText = params.Titolo;
        document.getElementById('scheda-durata').innerText = params.Durata;
        document.getElementById('scheda-genere').innerText = params.Nome_Genere;
        document.getElementById('scheda-anno').innerText = params.Anno;
        document.getElementById('scheda-regia').innerText = params.Regia;
        document.getElementById('scheda-sinossi').innerText = params.Sinossi;
        document.getElementById('scheda-occasioni').innerText = params.Occasioni;
        let rat = Math.round(parseFloat(params.Rating));
        let rating = "";
        for (let n = 0; n < rat; n++) {
            rating += "★";
        }
        for (let n = rat; n < 10; n++) {
            rating += "☆";
        }
        document.getElementById('scheda-rating').innerHTML = rating +" "+ params.Rating+"/10";
        return this;
    };

    this.login = () => {
        this.loaded = document.getElementById('overlay_login');
        const login_form = document.getElementById('login-form');

        login_form.onsubmit = () => {
            try {
                let username = login_form[0].value;
                let password = login_form[1].value;
                $.ajax({
                    type: "POST",
                    url: "./backend/admin_api.php/login",
                    data: {username, password}
                }).done((data) => {
                    let response = JSON.parse(data);
                    if (response.logged && response.logged === "true") {
                        logged = true;
                        console.info("logged");
                    }
                }).fail(() => {

                }).always(() => {
                    if (logged) {
                        btnLogin.style.display = "none";
                        btnLogout.style.display = "block";
                        this.hide();
                        request_dvd();
                    } else {
                        btnLogin.style.display = "block";
                        btnLogout.style.display = "none";
                        alert("Login Errato!");
                    }
                });
            } catch (e) {

            }
            return false;
        };
        return this;
    };

    this.show = () => {
        this.velo.style.display = "block";
        this.loaded.style.display = "block";
    };

    this.hide = () => {
        this.velo.style.display = "none";
        this.loaded.style.display = "none";
    };
}

function Tabella() {
    this.tableBody = document.getElementById('table-body');
    this.rows = [];

    this.addRow = (params) => {
        let row = document.createElement('tr');
        let onclick = () => {
            overlay.schedafilm(params).show();
        };

        function td(text = "") {
            let td = document.createElement('td');
            td.innerText = text;
            td.onclick = onclick;
            td.style.cursor = "pointer";
            return td;
        }

        let Numero_Inventario = document.createElement('th');
        Numero_Inventario.scope = "row";
        Numero_Inventario.innerText = params.Inventario;
        row.appendChild(Numero_Inventario);
        row.appendChild(td(params.Titolo));
        row.appendChild(td(params.Regia));
        row.appendChild(td(params.Nome_Genere));
        row.appendChild(td(params.Anno));
        row.appendChild(td(params.Lingua_Originale));
        const disp = td(params.Disponibilita);
        disp.style.fontWeight = (params.Disponibilita === "Si") ? "normal" : "bold";
        row.appendChild(disp);

        let btn_prenota = document.createElement("button");
        btn_prenota.value = params.Inventario;
        btn_prenota.type = "button";
        if (params.Disponibilita === "Si") {
          btn_prenota.innerText = "Prenotare";
          btn_prenota.className = "btn btn-primary btn-prenota";
          btn_prenota.onclick = () => {
              overlay.prenotazione(btn_prenota.value).show();
          };
        } else {
          btn_prenota.innerText = "Restituire";
          btn_prenota.className = "btn btn-primary btn-success";
          btn_prenota.onclick = () => {
              restituzione(btn_prenota.value);
          };
        }
        if (!logged) {
            btn_prenota.disabled = true;
            btn_prenota.style.cursor = "not-allowed";
        }


        let Prenota = td();
        Prenota.onclick = null;
        Prenota.style.cursor = "default";
        Prenota.appendChild(btn_prenota);
        row.appendChild(Prenota);

        this.tableBody.appendChild(row);
        this.rows.push(row);
    };

    this.clear = () => {
        this.tableBody.innerHTML = "";
        this.rows = [];
    };
}

const overlay = new Overlay();
const tabella = new Tabella();

const liste = {
    titolo: document.getElementById('listatitoli'),
    genere: document.getElementById('listagenere'),
    regia: document.getElementById('listaregista'),
    anno: document.getElementById('listaanni'),
    lingua_originale: document.getElementById('listalingua'),
    rating: document.getElementById('rating'),
    disponibilita: document.getElementById('listadisponibilita'),
};
const datalists = {
    titolo: document.getElementById("inputtitolo"),
    genere: document.getElementById("inputgenere"),
    regia: document.getElementById("inputregista"),
};
let logged = false;

function restituzione(idfilm) {
    let ok = false;
    $.ajax({
        type: "POST",
        url: "./backend/admin_api.php/restituzione",
        data: {idfilm},
        success: function (data) {
            console.log(data);
            let response = JSON.parse(data);
            if (response.ok && response.ok === "true") {
                ok = true;
                console.info("restituzione ok!");
            }
        },
        error: function () {
            console.error("Errore restituzione dvd");
        }
    }).always(() => {
        request_dvd();
    });
}

function addOptionToList(lista, value) {
    let el = document.createElement('option');
    el.value = value;
    el.innerText = value;
    lista.appendChild(el);
}

function onclosevelo() {
    overlay.hide();
}

function onformsubmit() {
    try {
        request_dvd();
    } catch (e) {

    }
    return false;
}

function request_dvd() {
    const params = {};
    Object.keys(liste).forEach(key => {
        let obj = liste[key];
        let v;
        if (obj.tagName === "SELECT") {
            v = obj.value;
        } else if (obj.tagName === "DATALIST") {
            v = datalists[key].value;
        } else {
            return false;
        }
        if (v && v !== "")
            params[key] = v;
    });
    console.log(params);
    tabella.clear();
    $.ajax({
        url: "./backend/user_api.php/" + "dvd",
        data: params,
        success: function (result) {
            let json = JSON.parse(result);
            json.contenuto.dvd.forEach(row => {
                tabella.addRow(row);
            });
        },
        error: function () {
            console.error("Errore restituzione dvd");
        }
    });
}

btnReset.onclick = () => {
    Object.keys(liste).forEach(key => {
        let obj = liste[key];
        let v;
        if (obj.tagName === "SELECT") {
            obj.selectedIndex = 0;
        } else if (obj.tagName === "DATALIST") {
            datalists[key].value = "";
        } else {
            return false;
        }
    });
};

btnLogin.onclick = () => {
    overlay.login().show();
};

btnLogout.onclick = () => {
    $.get("./backend/admin_api.php/logout", () => {
        logged = false;
        request_dvd();
        btnLogin.style.display = "block";
        btnLogout.style.display = "none";
    });
};

ricercaAvanzata.onclick = () => {
    $(secondaRiga).toggle('slow');
};

window.onload = function () {
    secondaRiga.style.display = 'none';
    $.ajax({
        url: "./backend/user_api.php/" + "list",
        data: {"titolo": 1, "genere": 1, "regia": 1, "anno": 1, "lingua": 1},
        success: function (result) {
            let json = JSON.parse(result);
            console.log(json);
            if (json.contenuto.genere)
                json.contenuto.genere.forEach((genere) => addOptionToList(liste.genere, genere));
            if (json.contenuto.titolo)
                json.contenuto.titolo.forEach((value) => addOptionToList(liste.titolo, value));
            if (json.contenuto.regia)
                json.contenuto.regia.forEach((value) => addOptionToList(liste.regia, value));
            if (json.contenuto.anno)
                json.contenuto.anno.forEach((value) => addOptionToList(liste.anno, value));
            if (json.contenuto.lingua)
                json.contenuto.lingua.forEach((value) => addOptionToList(liste.lingua_originale, value));
        },
        error: function (err) {
            console.error("Server non raggiungibile, oppure errore generico.");
        }
    });

    $.get("./backend/admin_api.php/is_logged", (data) => {
        let response = JSON.parse(data);
        if (response.logged)
            if (response.logged === "true") {
                logged = true;
                console.info("logged");
            }
    }).fail(() => {
        console.info("not logged");
    }).always(() => {
        if (logged) {
            btnLogin.style.display = "none";
            btnLogout.style.display = "block";
        } else {
            btnLogin.style.display = "block";
            btnLogout.style.display = "none";
        }
        request_dvd({});
    });
};
