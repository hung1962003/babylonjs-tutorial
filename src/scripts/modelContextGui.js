import * as GUI from "@babylonjs/gui";

export function createModelContextGui({ scene }) {
  const adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    "modelContextGui",
    true,
    scene,
  );

  let currentMesh = null;
  const handlers = {
    onMove: null,
    onDelete: null,
  };

  const panel = new GUI.Rectangle("ctxPanel");
  panel.widthInPixels = 160;
  panel.heightInPixels = 140;
  panel.thickness = 1;
  panel.color = "#444";
  panel.background = "rgba(15,15,18,0.85)";
  panel.cornerRadius = 10;
  panel.isVisible = false;
  panel.isPointerBlocker = true;
  panel.zIndex = 50;
  adt.addControl(panel);

  const title = new GUI.TextBlock("ctxTitle", "");
  title.heightInPixels = 30;
  title.color = "#ccc";
  title.fontSizeInPixels = 12;
  title.fontWeight = "600";
  title.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  title.topInPixels = 8;
  title.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel.addControl(title);

  const btnStack = new GUI.StackPanel("ctxBtnStack");
  btnStack.isVertical = true;
  btnStack.spacing = 6;
  btnStack.topInPixels = 44;
  btnStack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel.addControl(btnStack);

  const makeBtn = (name, label, color) => {
    const btn = GUI.Button.CreateSimpleButton(name, label);
    btn.widthInPixels = 130;
    btn.heightInPixels = 32;
    btn.color = "white";
    btn.fontSizeInPixels = 13;
    btn.fontWeight = "500";
    btn.background = color;
    btn.cornerRadius = 5;
    btn.thickness = 0;
    btn.hoverCursor = "pointer";
    btnStack.addControl(btn);
    return btn;
  };

  const btnMove = makeBtn("btnMove", "Move", "rgba(100,200,120,0.55)");
  const btnDelete = makeBtn("btnDelete", "Delete", "rgba(220,70,70,0.55)");

  btnMove.onPointerClickObservable.add(() => {
    if (currentMesh && handlers.onMove) {
      handlers.onMove(currentMesh);
    }
  });

  btnDelete.onPointerClickObservable.add(() => {
    if (currentMesh && handlers.onDelete) {
      handlers.onDelete(currentMesh);
    }
  });

  const showForMesh = (mesh) => {
    if (!mesh) return;
    currentMesh = mesh;
    title.text = mesh.metadata?.modelName || mesh.name || "?";
    panel.linkWithMesh(mesh);
    panel.linkOffsetYInPixels = -120;
    panel.isVisible = true;
  };

  const hide = () => {
    panel.isVisible = false;
    panel.linkWithMesh(null);
    currentMesh = null;
  };

  const setHandlers = (nextHandlers) => {
    if (nextHandlers.onMove) handlers.onMove = nextHandlers.onMove;
    if (nextHandlers.onDelete) handlers.onDelete = nextHandlers.onDelete;
  };

  return {
    adt,
    showForMesh,
    hide,
    setHandlers,
    getCurrentMesh: () => currentMesh,
    isVisible: () => panel.isVisible,
  };
}
