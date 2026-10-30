// backend: src/controller/authority.controller.js
import authorityService from "../service/authority.service.js";

export const list = async (req, res, next) => {
  try {
    const data = await authorityService.list({
      ...req.query,
      ...req.body,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await authorityService.create(req.body);
    res.status(201).json({ success: true, message: "Member added", data });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await authorityService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Member updated", data });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await authorityService.remove(req.params.id);
    res.status(200).json({ success: true, message: "Member deleted" });
  } catch (err) {
    next(err);
  }
};

export const removeMany = async (req, res, next) => {
  try {
    const deleted = await authorityService.removeMany(req.body?.ids);
    res
      .status(200)
      .json({ success: true, message: "Members deleted", deleted });
  } catch (err) {
    next(err);
  }
};

export const getPermissions = async (req, res, next) => {
  try {
    const data = await authorityService.getPermissions();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const savePermissions = async (req, res, next) => {
  try {
    const data = await authorityService.savePermissions(req.body?.permissions);
    res.status(200).json({ success: true, message: "Permissions saved", data });
  } catch (err) {
    next(err);
  }
};
