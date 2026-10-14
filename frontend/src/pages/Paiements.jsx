import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
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
      setSearch("À encaisser");
      setFilterCurrentYear(false);
    } else if (statut === "encaissements") {
      setSearch(String(new Date().getFullYear()));
      setFilterCurrentYear(true);
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

  const filteredPaiements = useMemo(() => {
    const value = search.trim().toLowerCase();
    const currentYear = new Date().getFullYear();

    return paiements.filter((paiement) => {
      const prestation = paiement.Prestation_Paiement;
      const proprietaire = prestation?.Proprietaire_Prestation;

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

      const typePaiement = paiement.E_Reporting_Paiement
        ? "e-reporting"
        : paiement.E_Facture_Paiement
          ? "e-facture"
          : paiement.E_Other_Paiement
            ? "e-other"
            : "";

      const fields = [
        paiement.Date_Encaissement
          ? new Date(paiement.Date_Encaissement).toLocaleDateString("fr-FR")
          : "À encaisser",
        paiement.Date_Encaissement
          ? new Date(paiement.Date_Encaissement).getFullYear()
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
  }, [paiements, search, filterCurrentYear]);

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

      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-blue-900">
          {filteredPaiements.length} paiement
          {filteredPaiements.length > 1 ? "s" : ""}
        </p>

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
