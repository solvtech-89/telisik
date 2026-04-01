import React, { useState } from "react";
import { Alert, Button, Input, Modal } from "./ui";

function DeleteActorModal({ show, onClose, onConfirm }) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Konfirmasi Penghapusan"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Hapus
          </Button>
        </>
      }
    >
      <p>Hapus aktor ini dari daftar? Tindakan ini tidak dapat dibatalkan.</p>
    </Modal>
  );
}

export default function ActorInterestManager({ actors, setActors }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [actorAlert, setActorAlert] = useState({ type: "", message: "" });
  const [deleteActorIndex, setDeleteActorIndex] = useState(null);
  const [currentActor, setCurrentActor] = useState({
    name: "",
    affiliation: "",
    region: "",
    interest: 0,
    power: 0,
    note: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const resetCurrentActor = () => {
    setCurrentActor({
      name: "",
      affiliation: "",
      region: "",
      interest: 0,
      power: 0,
      note: "",
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingIndex(null);
    setActorAlert({ type: "", message: "" });
    resetCurrentActor();
  };

  const closeDeleteModal = () => {
    setDeleteActorIndex(null);
  };

  const handleAddActor = () => {
    if (!currentActor.name.trim()) {
      setActorAlert({
        type: "error",
        message: "Nama aktor wajib diisi.",
      });
      return;
    }

    if (editingIndex !== null) {
      const updated = [...actors];
      updated[editingIndex] = currentActor;
      setActors(updated);
    } else {
      setActors([...actors, currentActor]);
    }

    closeModal();
  };

  const handleEdit = (index) => {
    setCurrentActor(actors[index]);
    setEditingIndex(index);
    setActorAlert({ type: "", message: "" });
    setShowAddModal(true);
  };

  const handleDelete = (index) => {
    setDeleteActorIndex(index);
  };

  const confirmDelete = () => {
    if (deleteActorIndex === null) return;
    setActors(actors.filter((_, i) => i !== deleteActorIndex));
    closeDeleteModal();
  };

  return (
    <>
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-2xl font-semibold text-telisik">
            Aktor & Kepentingan
          </h2>
          <Button
            onClick={() => {
              setActorAlert({ type: "", message: "" });
              setShowAddModal(true);
            }}
            className="bg-emerald-600 px-3 py-1.5 text-sm hover:bg-emerald-700"
          >
            + Tambah Aktor
          </Button>
        </div>

        {actors.length > 0 ? (
          <div className="editor-actor-table-wrap overflow-x-auto rounded-lg border border-gray-200 bg-[#F9F6EF]">
            <table className="min-w-full text-sm">
              <thead className="editor-actor-table-head sticky top-0 bg-[#f4f1e8]">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Nama
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Afiliasi
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Interest
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Power
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {actors.map((actor, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-3 py-3">{actor.name}</td>
                    <td className="px-3 py-3">{actor.affiliation || "-"}</td>
                    <td className="px-3 py-3 text-center">{actor.interest}</td>
                    <td className="px-3 py-3 text-center">{actor.power}</td>
                    <td className="px-3 py-3 text-center">
                      <Button
                        onClick={() => handleEdit(index)}
                        size="sm"
                        className="mr-1 bg-blue-500 px-2 py-1 text-xs hover:bg-blue-600"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(index)}
                        size="sm"
                        variant="danger"
                        className="px-2 py-1 text-xs"
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="editor-actor-empty mt-3 italic text-gray-400">
            Belum ada aktor yang ditambahkan
          </p>
        )}
      </div>

      <Modal
        show={showAddModal}
        onClose={closeModal}
        title={`${editingIndex !== null ? "Edit" : "Tambah"} Aktor`}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAddActor}
            >
              {editingIndex !== null ? "Simpan" : "Tambah"}
            </Button>
          </>
        }
      >
        {actorAlert.message ? (
          <Alert
            type={actorAlert.type || "error"}
            message={actorAlert.message}
            dismissible
            onClose={() => setActorAlert({ type: "", message: "" })}
            className="mb-4"
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Nama Aktor *"
              value={currentActor.name}
              onChange={(e) =>
                setCurrentActor({ ...currentActor, name: e.target.value })
              }
              placeholder="Contoh: PT Sawit Jaya"
              required
            />
          </div>
          <Input
            label="Afiliasi"
            value={currentActor.affiliation}
            onChange={(e) =>
              setCurrentActor({ ...currentActor, affiliation: e.target.value })
            }
            placeholder="Contoh: Perusahaan Swasta"
          />
          <Input
            label="Wilayah"
            value={currentActor.region}
            onChange={(e) =>
              setCurrentActor({ ...currentActor, region: e.target.value })
            }
            placeholder="Contoh: Kalimantan Tengah"
          />
          <Input
            type="number"
            label="Interest (0-10)"
            min="0"
            max="10"
            step="0.1"
            value={currentActor.interest}
            onChange={(e) =>
              setCurrentActor({
                ...currentActor,
                interest: Number.parseFloat(e.target.value || "0"),
              })
            }
          />
          <Input
            type="number"
            label="Power (0-10)"
            min="0"
            max="10"
            step="0.1"
            value={currentActor.power}
            onChange={(e) =>
              setCurrentActor({
                ...currentActor,
                power: Number.parseFloat(e.target.value || "0"),
              })
            }
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Catatan
            </label>
            <textarea
              className="editor-actor-note w-full rounded-lg border-2 border-gray-300 bg-[#F9F6EF] px-3 py-2 text-sm placeholder:text-gray-400 focus:border-telisik focus:outline-none focus:ring-2 focus:ring-telisik/10"
              rows="3"
              value={currentActor.note}
              onChange={(e) =>
                setCurrentActor({ ...currentActor, note: e.target.value })
              }
              placeholder="Catatan tambahan tentang aktor ini..."
            />
          </div>
        </div>
      </Modal>

      <DeleteActorModal
        show={deleteActorIndex !== null}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </>
  );
}
