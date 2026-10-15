import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import { CardFilter } from "../components/ui/Card.jsx";
import { formatDateShort } from "../utils/formatDate";
import PaiementsModal from "../components/Modals/Paiements_Modal.jsx";
import Alert from "../components/ui/Alert.jsx";
import Table, {
  Vide,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";

import {
  getPaiements,
  createPaiement,
  updatePaiement,
  deletePaiement,
} from "../api/paiements.js";

import { getPrestations } from "../api/prestations.js";

const emptyForm = {
  ID_Prestation: "",
  Date_Paiement: "",
  Date_Encaissement: "",
  Montant_Paiement: "",
  Moyen_Paiement: "",
  E_Reporting_Paiement: false,
  E_Facture_Paiement: false,
  E_Other_Paiement: false,
};

export default function Paiements() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paiements, setPaiements] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPrestation, setSelectedPrestation] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCurrentYear, setFilterCurrentYear] = useState(false);
  const [filterCurrentMonth, setFilterCurrentMonth] = useState(false);
  const [filterPaiement, setFilterPaiement] = useState(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [paiementsData, prestationsData] = await Promise.all([
        getPaiements(),
        getPrestations(),
      ]);

      setPaiements(paiementsData);
      setPrestations(prestationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statut = params.get("statut");

    if (statut === "a-encaisser") {
      setFilterPaiement("a-encaisser");
      setSearch("À encaisser");
      setFilterCurrentYear(false);
      setFilterCurrentMonth(false);
    } else if (statut === "encaissements") {
      setFilterPaiement(null);
      setFilterCurrentYear(true);
      setFilterCurrentMonth(false);
      setSearch(String(new Date().getFullYear()));
    } else if (statut === "encaissements-mois") {
      setFilterPaiement(null);
      setFilterCurrentYear(false);
      setFilterCurrentMonth(true);
      setSearch(
        new Date().toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        }),
      );
    }

    if (statut) {
      navigate(location.pathname, {
        replace: true,
        state: location.state,
      });
    }
  }, [location.search, location.pathname, location.state, navigate]);

  function handleSearchChange(value) {
    setSearch(value);

    if (!value.trim()) {
      setFilterCurrentYear(false);
      setFilterCurrentMonth(false);
      setFilterPaiement(null);
    }
  }

  function isPaiementComplete(form) {
    const hasMoyen = Boolean(form.Moyen_Paiement?.trim());

    const hasType =
      form.E_Reporting_Paiement ||
      form.E_Facture_Paiement ||
      form.E_Other_Paiement;

    return hasMoyen && hasType;
  }

  function openEditForm(paiement) {
    setEditingId(paiement.ID_Paiement);

    setSelectedPrestation(
      paiement.Prestation_Paiement ??
        prestations.find(
          (item) =>
            String(item.ID_Prestation) === String(paiement.ID_Prestation),
        ) ??
        null,
    );

    setForm({
      ID_Prestation: paiement.ID_Prestation ?? "",

      Date_Paiement: paiement.Date_Paiement
        ? paiement.Date_Paiement.slice(0, 10)
        : "",

      Date_Encaissement: paiement.Date_Encaissement
        ? paiement.Date_Encaissement.slice(0, 10)
        : "",

      Montant_Paiement: paiement.Montant_Paiement ?? "",
      Moyen_Paiement: paiement.Moyen_Paiement || "",
      E_Reporting_Paiement: paiement.E_Reporting_Paiement ?? false,
      E_Facture_Paiement: paiement.E_Facture_Paiement ?? false,
      E_Other_Paiement: paiement.E_Other_Paiement ?? false,
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setSelectedPrestation(null);
    setForm(emptyForm);
  }

  function openPrestation(prestation) {
    if (!prestation?.ID_Prestation) {
      return;
    }

    navigate("/dashboard/prestations", {
      state: {
        openPrestationId: prestation.ID_Prestation,
      },
    });

    setShowForm(false);
  }

  function getProprietaireLabel(prestation) {
    const proprietaire = prestation.Proprietaire_Prestation;

    if (!proprietaire) {
      return "-";
    }

    if (proprietaire.Etablissement) {
      return (
        <span className="flex flex-col md:flex-row md:gap-1 justify-center">
          <span>{proprietaire.Raison_sociale}</span>

          <span>{proprietaire.Etablissement}</span>
        </span>
      );
    }

    return (
      <span className="flex flex-col md:flex-row md:gap-1 justify-center">
        <span>{proprietaire.Prenom_Proprietaire}</span>

        <span>{proprietaire.Nom_Proprietaire}</span>
      </span>
    );
  }

  function togglePaymentFilter(filter) {
    const labels = {
      "a-encaisser": "À encaisser",
      "e-reporting": "E-Reporting",
      "e-facture": "E-Facture",
      "e-autre": "E-Autre",
      cheque: "Chèque",
      especes: "Espèces",
      virement: "Virement",
    };

    setFilterPaiement((current) => {
      const next = current === filter ? null : filter;
      setSearch(next ? labels[next] : "");
      setFilterCurrentYear(false);
      setFilterCurrentMonth(false);
      return next;
    });
  }

  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function isInCurrentMonth(dateValue) {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const now = new Date();

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  const filteredPaiements = useMemo(() => {
    const value = search.trim().toLowerCase();
    const currentYear = new Date().getFullYear();

    return paiements.filter((paiement) => {
      const prestation = paiement.Prestation_Paiement;
      const proprietaire = prestation?.Proprietaire_Prestation;

      if (filterPaiement === "a-encaisser" && paiement.Date_Encaissement) {
        return false;
      }

      if (filterPaiement === "e-reporting" && !paiement.E_Reporting_Paiement) {
        return false;
      }

      if (filterPaiement === "e-facture" && !paiement.E_Facture_Paiement) {
        return false;
      }

      if (filterPaiement === "e-autre" && !paiement.E_Other_Paiement) {
        return false;
      }

      if (
        ["cheque", "especes", "virement"].includes(filterPaiement) &&
        normalizeText(paiement.Moyen_Paiement) !== filterPaiement
      ) {
        return false;
      }

      if (filterCurrentYear) {
        if (!paiement.Date_Encaissement) {
          return false;
        }

        const date = new Date(paiement.Date_Encaissement);

        if (
          Number.isNaN(date.getTime()) ||
          date.getFullYear() !== currentYear
        ) {
          return false;
        }
      }

      if (filterCurrentMonth && !isInCurrentMonth(paiement.Date_Encaissement)) {
        return false;
      }

      const typePaiement = paiement.E_Reporting_Paiement
        ? "e-reporting"
        : paiement.E_Facture_Paiement
          ? "e-facture"
          : paiement.E_Other_Paiement
            ? "e-autre"
            : "";

      const fields = [
        paiement.Date_Encaissement
          ? new Date(paiement.Date_Encaissement).toLocaleDateString("fr-FR")
          : "À encaisser",

        paiement.Date_Encaissement
          ? new Date(paiement.Date_Encaissement).getFullYear()
          : "",

        paiement.Date_Encaissement
          ? new Date(paiement.Date_Encaissement).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })
          : "",

        paiement.Montant_Paiement,
        paiement.Moyen_Paiement,
        typePaiement,
        proprietaire?.Nom_Proprietaire,
        proprietaire?.Prenom_Proprietaire,
        proprietaire?.Etablissement,
        proprietaire?.Raison_sociale,
      ];

      return fields
        .filter((field) => field !== null && field !== undefined)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [
    paiements,
    search,
    filterCurrentYear,
    filterCurrentMonth,
    filterPaiement,
  ]);

  const totalMontant = useMemo(() => {
    return filteredPaiements.reduce(
      (total, paiement) => total + (Number(paiement.Montant_Paiement) || 0),
      0,
    );
  }, [filteredPaiements]);

  async function handleSubmit(event) {
    event.preventDefault();

    const paiementComplete = isPaiementComplete(form);

    if (form.Date_Encaissement && !paiementComplete) {
      setError(
        "Un moyen de paiement et un type de paiement sont nécessaires pour renseigner la date d'encaissement.",
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updatePaiement(editingId, form);
      } else {
        await createPaiement(form);
      }

      await loadData();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce paiement ?")) {
      return;
    }

    try {
      setError("");

      await deletePaiement(id);

      if (editingId === id) {
        closeForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title={
          <>
            <span className="hidden md:inline">Gestion des Paiements</span>

            <span className="md:hidden">Paiements</span>
          </>
        }
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher un paiement..."
        className="mb-6"
      />

      <div className="mb-5 grid gap-1 xl:grid-cols-3">
        {/* Year, Month and uncashed */}
        <div className="flex flex-wrap justify-center gap-1">
          <CardFilter
            title={`${new Date().getFullYear()}`}
            value={
              paiements.filter((p) => {
                if (!p.Date_Encaissement) return false;
                const date = new Date(p.Date_Encaissement);
                return (
                  !Number.isNaN(date.getTime()) &&
                  date.getFullYear() === new Date().getFullYear()
                );
              }).length
            }
            color="green"
            active={filterCurrentYear}
            onClick={() => {
              const next = !filterCurrentYear;
              setFilterCurrentYear(next);
              setFilterCurrentMonth(false);
              setFilterPaiement(null);
              setSearch(next ? String(new Date().getFullYear()) : "");
            }}
            className="min-w-24"
          />

          <CardFilter
            title={new Date()
              .toLocaleDateString("fr-FR", { month: "long" })
              .replace(/^./, (char) => char.toUpperCase())}
            value={
              paiements.filter((p) => isInCurrentMonth(p.Date_Encaissement))
                .length
            }
            color="green"
            active={filterCurrentMonth}
            onClick={() => {
              const next = !filterCurrentMonth;
              setFilterCurrentMonth(next);
              setFilterCurrentYear(false);
              setFilterPaiement(null);
              setSearch(
                next
                  ? new Date().toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })
                  : "",
              );
            }}
            className="min-w-24"
          />

          <CardFilter
            title="À encaisser"
            value={paiements.filter((p) => !p.Date_Encaissement).length}
            color="purple"
            active={filterPaiement === "a-encaisser"}
            onClick={() => {
              setFilterCurrentYear(false);
              setFilterCurrentMonth(false);
              togglePaymentFilter("a-encaisser");
            }}
            className="min-w-24"
          />
        </div>

        {/* Moyen de paiements */}
        <div
          className={`
            flex flex-wrap justify-center gap-1 transition-all duration-300 ease-in-out
            ${
              showMoreFilters
                ? "max-h-40 opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-2 pointer-events-none xl:max-h-40 xl:opacity-100 xl:translate-y-0"
            }
          `}
        >
          <CardFilter
            title="Chèque"
            value={
              paiements.filter(
                (p) => normalizeText(p.Moyen_Paiement) === "cheque",
              ).length
            }
            color="blue"
            active={filterPaiement === "cheque"}
            onClick={() => {
              setFilterCurrentMonth(false);
              togglePaymentFilter("cheque");
            }}
            className="min-w-24"
          />

          <CardFilter
            title="Espèces"
            value={
              paiements.filter(
                (p) => normalizeText(p.Moyen_Paiement) === "especes",
              ).length
            }
            color="blue"
            active={filterPaiement === "especes"}
            onClick={() => {
              setFilterCurrentMonth(false);
              togglePaymentFilter("especes");
            }}
            className="min-w-24"
          />

          <CardFilter
            title="Virement"
            value={
              paiements.filter(
                (p) => normalizeText(p.Moyen_Paiement) === "virement",
              ).length
            }
            color="blue"
            active={filterPaiement === "virement"}
            onClick={() => {
              setFilterCurrentMonth(false);
              togglePaymentFilter("virement");
            }}
            className="min-w-24"
          />
        </div>

        {/* Types */}
        <div
          className={`
            flex flex-wrap justify-center gap-1
            transition-all duration-300 ease-in-out
            ${
              showMoreFilters
                ? "max-h-40 opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-2 pointer-events-none xl:max-h-40 xl:opacity-100 xl:translate-y-0"
            }
          `}
        >
          <CardFilter
            title="E-Reporting"
            value={paiements.filter((p) => p.E_Reporting_Paiement).length}
            color="blue"
            active={filterPaiement === "e-reporting"}
            onClick={() => {
              setFilterCurrentMonth(false);
              togglePaymentFilter("e-reporting");
            }}
            className="min-w-24"
          />

          <CardFilter
            title="E-Facture"
            value={paiements.filter((p) => p.E_Facture_Paiement).length}
            color="blue"
            active={filterPaiement === "e-facture"}
            onClick={() => {
              setFilterCurrentMonth(false);
              togglePaymentFilter("e-facture");
            }}
            className="min-w-24"
          />

          <CardFilter
            title="E-Autre"
            value={paiements.filter((p) => p.E_Other_Paiement).length}
            color="blue"
            active={filterPaiement === "e-autre"}
            onClick={() => {
              setFilterCurrentMonth(false);
              togglePaymentFilter("e-autre");
            }}
            className="min-w-24"
          />
        </div>
      </div>

      {/* Infos bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        {/* Count */}
        <p className="text-sm text-blue-900">
          {filteredPaiements.length} paiement
          {filteredPaiements.length > 1 ? "s" : ""}
        </p>

        {/* More filters */}
        <button
          type="button"
          onClick={() => setShowMoreFilters((prev) => !prev)}
          className="xl:hidden flex items-center justify-center gap-1 mx-auto cursor-pointer text-blue-900 hover:font-medium"
          aria-expanded={showMoreFilters}
          aria-label={
            showMoreFilters
              ? "Masquer les filtres supplémentaires"
              : "Afficher les filtres supplémentaires"
          }
        >
          <span className="text-sm">
            {showMoreFilters ? "Moins de filtres" : "Plus de filtres"}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              showMoreFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Total */}
        <p className="text-sm font-semibold text-blue-900 pr-2">
          Total :{" "}
          {totalMontant.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
        </p>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredPaiements.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Encaissé</TableHeader>
              <TableHeader>Propriétaire</TableHeader>
              <TableHeader>Montant</TableHeader>
              <TableHeader className="hidden lg:table-cell">Moyen</TableHeader>
              <TableHeader className="hidden lg:table-cell">Type</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredPaiements.map((paiement) => (
              <TableRow
                key={paiement.ID_Paiement}
                onClick={() => openEditForm(paiement)}
              >
                <TableCell>
                  {paiement.Date_Encaissement
                    ? formatDateShort(paiement.Date_Encaissement)
                    : "À encaisser"}
                </TableCell>

                <TableCell>
                  {paiement.Prestation_Paiement
                    ? getProprietaireLabel(paiement.Prestation_Paiement)
                    : "-"}
                </TableCell>

                <TableCell>{paiement.Montant_Paiement ?? "-"} €</TableCell>

                <TableCell className="hidden lg:table-cell">
                  {paiement.Moyen_Paiement || "-"}
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  {paiement.E_Reporting_Paiement
                    ? "E-Reporting"
                    : paiement.E_Facture_Paiement
                      ? "E-Facture"
                      : paiement.E_Other_Paiement
                        ? "E-Other"
                        : "-"}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <PaiementsModal
        open={showForm}
        editingId={editingId}
        form={form}
        setForm={setForm}
        prestations={prestations}
        prestation={selectedPrestation}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onOpenPrestation={() => openPrestation(selectedPrestation)}
      />
    </div>
  );
}
