import { useCallback, useEffect, useState } from "react";
import adminProfileService, {
  getErrorMessage,
} from "../services/adminProfile.service";
import {
  INITIAL_PROFILE,
  MAX_IMAGE_SIZE,
  MESSAGES,
} from "../constants/roles.constants";
import { isProfileDraftInvalid } from "../utils/roles.utils";

/**
 * Saved profile + the copy being edited, loading from the backend,
 * saving, photo upload / delete and copy-email.
 */
export default function useProfile({ showToast }) {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draft, setDraft] = useState(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);

  // Put what the backend sent into the page state
  const applyProfile = useCallback((data) => {
    setProfile(data);
    setDraft(data);
  }, []);

  // Load the profile when the page opens
  useEffect(() => {
    let cancelled = false;

    adminProfileService
      .getProfile()
      .then((data) => {
        if (!cancelled) applyProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(getErrorMessage(err, MESSAGES.loadFailed), "error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applyProfile, showToast]);

  // ----- edit / save -----
  const updateDraft = (field, value) =>
    setDraft((previous) => ({ ...previous, [field]: value }));

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setEditing(false);
  };

  const draftInvalid = isProfileDraftInvalid(draft);

  const saveProfile = async () => {
    if (draftInvalid) return;

    try {
      const data = await adminProfileService.updateProfile(draft);
      applyProfile(data);
      setEditing(false);
      showToast(MESSAGES.updated);
    } catch (err) {
      showToast(getErrorMessage(err, MESSAGES.updateFailed), "error");
    }
  };

  // ----- photo (saved straight away) -----
  const setImage = (image) => {
    // only the picture changes, so unsaved edits in the form are kept
    setProfile((previous) => ({ ...previous, image }));
    setDraft((previous) => ({ ...previous, image }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets you choose the same file again
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(MESSAGES.notAnImage, "error");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showToast(MESSAGES.imageTooLarge, "error");
      return;
    }

    try {
      const data = await adminProfileService.uploadImage(file);
      setImage(data.image);
      showToast(MESSAGES.photoUpdated);
    } catch (err) {
      showToast(getErrorMessage(err, MESSAGES.photoUploadFailed), "error");
    }
  };

  const deleteImage = async () => {
    try {
      await adminProfileService.deleteImage();
      setImage("");
      showToast(MESSAGES.photoRemoved);
    } catch (err) {
      showToast(getErrorMessage(err, MESSAGES.photoRemoveFailed), "error");
    }
  };

  // ----- copy email -----
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      showToast(MESSAGES.emailCopied);
    } catch {
      showToast(MESSAGES.emailCopyFailed, "error");
    }
  };

  return {
    profile,
    draft,
    editing,
    draftInvalid,
    updateDraft,
    startEdit,
    cancelEdit,
    saveProfile,
    handleImageChange,
    deleteImage,
    copyEmail,
  };
}
