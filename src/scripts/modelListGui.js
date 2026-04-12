import * as GUI from "@babylonjs/gui";

function addModelRow({
  list,
  modelRoot,
  idx,
  rowHeight,
  onHoverIn,
  onHoverOut,
  onSelect,
  showExportJson,
  onExportJson,
  showExportGlb,
  onExportGlb,
  showDelete,
  onDelete,
}) {
  const row = new GUI.Rectangle(`row_${modelRoot.name}_${idx}`);
  row.heightInPixels = rowHeight;
  row.thickness = 0;
  row.background = "rgba(255,255,255,0.06)";
  row.cornerRadius = 6;
  row.width = 1;
  row.paddingLeftInPixels = 10;
  row.paddingRightInPixels = 10;

  row.onPointerEnterObservable.add(() => {
    row.background = "rgba(255,255,255,0.16)";
    onHoverIn?.(modelRoot, idx);
  });
  row.onPointerOutObservable.add(() => {
    row.background = "rgba(255,255,255,0.06)";
    onHoverOut?.(modelRoot, idx);
  });

  list.addControl(row);

  const grid = new GUI.Grid(`grid_${modelRoot.name}_${idx}`);
  grid.addColumnDefinition(1);
  if (showExportJson) {
    grid.addColumnDefinition(42, true);
  }
  if (showExportGlb) {
    grid.addColumnDefinition(42, true);
  }
  if (showDelete) {
    grid.addColumnDefinition(38, true);
  }
  grid.addColumnDefinition(60, true);
  grid.addRowDefinition(1);
  row.addControl(grid);

  const label = new GUI.TextBlock(`label_${modelRoot.name}_${idx}`, modelRoot.name);
  label.color = "white";
  label.fontSizeInPixels = 13;
  label.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  label.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  label.paddingLeftInPixels = 8;
  grid.addControl(label, 0, 0);

  let col = 1;
  if (showExportJson) {
    const btnJson = GUI.Button.CreateSimpleButton(`btnJson_${modelRoot.name}_${idx}`, "JSON");
    btnJson.widthInPixels = 38;
    btnJson.heightInPixels = 28;
    btnJson.color = "white";
    btnJson.fontSizeInPixels = 9;
    btnJson.background = "rgba(100,140,200,0.5)";
    btnJson.cornerRadius = 4;
    btnJson.thickness = 0;
    btnJson.onPointerClickObservable.add(() => onExportJson?.(modelRoot, idx));
    grid.addControl(btnJson, 0, col);
    col += 1;
  }
  if (showExportGlb) {
    const btnGlb = GUI.Button.CreateSimpleButton(`btnGlb_${modelRoot.name}_${idx}`, "GLB");
    btnGlb.widthInPixels = 38;
    btnGlb.heightInPixels = 28;
    btnGlb.color = "white";
    btnGlb.fontSizeInPixels = 9;
    btnGlb.background = "rgba(200,160,80,0.45)";
    btnGlb.cornerRadius = 4;
    btnGlb.thickness = 0;
    btnGlb.onPointerClickObservable.add(() => onExportGlb?.(modelRoot, idx));
    grid.addControl(btnGlb, 0, col);
    col += 1;
  }

  if (showDelete) {
    const btnDel = GUI.Button.CreateSimpleButton(`btnDel_${modelRoot.name}_${idx}`, "Del");
    btnDel.widthInPixels = 34;
    btnDel.heightInPixels = 28;
    btnDel.color = "white";
    btnDel.fontSizeInPixels = 10;
    btnDel.background = "rgba(200,72,72,0.55)";
    btnDel.cornerRadius = 4;
    btnDel.thickness = 0;
    btnDel.onPointerClickObservable.add(() => onDelete?.(modelRoot, idx, row));
    grid.addControl(btnDel, 0, col);
    col += 1;
  }

  const btn = GUI.Button.CreateSimpleButton(`btn_${modelRoot.name}_${idx}`, "Select");
  btn.widthInPixels = 56;
  btn.heightInPixels = 32;
  btn.color = "white";
  btn.fontSizeInPixels = 12;
  btn.background = "rgba(77,216,224,0.35)";
  btn.cornerRadius = 4;
  btn.thickness = 0;
  btn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  btn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  btn.onPointerClickObservable.add(() => onSelect?.(modelRoot, idx));
  grid.addControl(btn, 0, col);

  return { row, grid };
}

export function createModelListGui({
  scene,
  models,
  title = "Models",
  panelWidth = 280,
  panelPadding = 12,
  rowHeight = 56,
  rowGap = 6,
  onHoverIn,
  onHoverOut,
  onSelect,
} = {}) {
  const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene);

  const handlers = {
    onExportJson: null,
    onExportGlb: null,
    onDeleteCustom: null,
    onImport: null,
  };

  const container = new GUI.Rectangle("modelListContainer");
  container.widthInPixels = panelWidth;
  container.adaptHeightToChildren = true;
  container.thickness = 1;
  container.color = "#2b2b2b";
  container.background = "rgba(20,20,20,0.60)";
  container.cornerRadius = 8;
  container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  container.leftInPixels = panelPadding;
  container.topInPixels = -panelPadding;
  container.paddingLeftInPixels = panelPadding;
  container.paddingRightInPixels = panelPadding;
  container.paddingTopInPixels = panelPadding;
  container.paddingBottomInPixels = panelPadding;
  ui.addControl(container);

  const inner = new GUI.StackPanel("modelListInner");
  inner.isVertical = true;
  inner.width = 1;
  inner.spacing = 0;
  container.addControl(inner);

  const titleBlock = new GUI.TextBlock("title", title);
  titleBlock.heightInPixels = 28;
  titleBlock.color = "white";
  titleBlock.fontSizeInPixels = 15;
  titleBlock.fontWeight = "600";
  titleBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  titleBlock.paddingBottomInPixels = 6;
  inner.addControl(titleBlock);

  const importSlot = new GUI.StackPanel("importSlot");
  importSlot.isVertical = true;
  importSlot.width = 1;
  importSlot.spacing = 6;
  importSlot.paddingBottomInPixels = rowGap;
  inner.addControl(importSlot);

  const list = new GUI.StackPanel("list");
  list.isVertical = true;
  list.width = 1;
  list.spacing = rowGap;
  inner.addControl(list);

  let rowIndex = 0;
  const appendModelRow = (modelRoot, options = {}) => {
    const {
      showExportJson = false,
      showExportGlb = false,
      onExportJson,
      onExportGlb,
      showDelete = false,
      onDelete,
    } = options;
    const idx = rowIndex++;
    const isCustom = !!modelRoot.metadata?.isCustomScaffold;
    const useDelete = showDelete || isCustom;
    const jsonOn =
      onExportJson ??
      (showExportJson ? () => handlers.onExportJson?.(modelRoot) : undefined);
    const glbOn =
      onExportGlb ??
      (showExportGlb ? () => handlers.onExportGlb?.(modelRoot) : undefined);
    return addModelRow({
      list,
      modelRoot,
      idx,
      rowHeight,
      onHoverIn,
      onHoverOut,
      onSelect,
      showExportJson,
      onExportJson: jsonOn,
      showExportGlb,
      onExportGlb: glbOn,
      showDelete: useDelete,
      onDelete:
        onDelete ??
        (useDelete
          ? (mr, _idx, rowRef) => handlers.onDeleteCustom?.(mr, rowRef)
          : undefined),
    });
  };

  (models || []).forEach((modelRoot) => {
    const custom = !!modelRoot.metadata?.isCustomScaffold;
    appendModelRow(modelRoot, {
      showExportJson: custom,
      showExportGlb: custom,
    });
  });

  const setCustomHandlers = (h) => {
    if (h.onExportJson != null) handlers.onExportJson = h.onExportJson;
    if (h.onExportGlb != null) handlers.onExportGlb = h.onExportGlb;
    if (h.onDeleteCustom != null) handlers.onDeleteCustom = h.onDeleteCustom;
    if (h.onImport != null) handlers.onImport = h.onImport;
  };

  const addImportButton = () => {
    const btn = GUI.Button.CreateSimpleButton("btnImportScaffold", "Import scaffold (.json)");
    btn.heightInPixels = 36;
    btn.width = 1;
    btn.color = "white";
    btn.fontSizeInPixels = 12;
    btn.background = "rgba(100,140,200,0.4)";
    btn.cornerRadius = 6;
    btn.thickness = 0;
    btn.onPointerClickObservable.add(() => handlers.onImport?.());
    importSlot.addControl(btn);
  };

  return {
    ui,
    container,
    list,
    appendModelRow,
    addImportButton,
    setCustomHandlers,
  };
}
