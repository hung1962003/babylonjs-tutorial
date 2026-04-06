canvas :dung de hien thi kiet tac tren html 
//engine :la bo nao chuyen doi logic => 3d song 
scene : khong gian 3d cho cac doi tuong 3d 
camera : hien thi khong gian nhat dinh trong 1 scene

mesh gom 2 thu : tap hop cac diem va duong thang dai dien cho hinh dang cua no va 
                vat lieu la lop bao phu cac duong thang va diem 
                tập hợp các vertex(đỉnh) + index + normal + uv + material 
                đỉnh, Triangle(tam giác), Index Buffer(Chỉ định vertex nào tạo thành triangle.),Normal(Vector chỉ hướng bề mặt.),UV(Tọa độ texture.Cho biết ảnh dán vào mặt như thế nào.)
material:tập hợp các thuộc tính quyết định bề mặt của mesh trông như thế nào khi render.
Màu chính (Diffuse / Albedo)
Độ bóng (Specular)
Độ nhám (Roughness)
Kim loại (Metallic)
Texture (Ảnh phủ lên bề mặt)


| Thuộc tính      | Ý nghĩa                             |
| --------------- | ----------------------------------- |
| `diffuseColor`  | màu chính của vật                   |
| `specularColor` | màu phản chiếu ánh sáng             |
| `emissiveColor` | màu vật tự phát sáng khi không cần nguồn sáng |
| `ambientColor`  | màu khi không có ánh sáng trực tiếp |


| Camera            | Đặc điểm                        |
| ----------------- | ------------------------------- |
| `UniversalCamera` | giống camera FPS (đi lại tự do) |
| `ArcRotateCamera` | quay quanh một object           |

 `ArcRotateCamera`
| Tham số    | Ý nghĩa                     |
| ---------- | --------------------------- |
| `"camera"` | tên camera                  |
| `alpha`    | góc quay ngang quanh object |
| `beta`     | góc quay dọc                |
| `radius`   | khoảng cách camera          |
| `target`   | điểm camera nhìn vào        |
| `scene`    | scene Babylon               |



| Texture       | Công dụng         |
| ------------- | ----------------- |
| Diffuse       | màu chính         |
| Normal / Bump | tạo gồ ghề        |
| Specular      | độ bóng           |
| Emissive      | phát sáng         |
| Opacity       | trong suốt        |
| Ambient       | bóng tối tự nhiên |
| Reflection    | phản chiếu        |
| Refraction    | khúc xạ ánh sáng  |
| Lightmap      | ánh sáng baked    |


emissiveTexture.uScale = 5; //đang thay đổi tỉ lệ lặp của texture theo trục U (trục ngang)
emissiveTexture.vScale = 5; //đang thay đổi tỉ lệ lặp của texture theo trục V (trục dọc)
emissiveTexture.uOffset = 1.4; // dời/cắt hình ảnh đi 1/2 và gắn lại phần đầu  theo trục X (trục ngang)
emissiveTexture.
vOffset = 1.4;


x: x
y:z
z:y 

| Gizmo            | Chức năng          |
| ---------------- | ------------------ |
| PositionGizmo    | di chuyển          |
| RotationGizmo    | xoay               |
| ScaleGizmo       | scale              |
| BoundingBoxGizmo | chỉnh bounding box |


BABYLON.Animation.CreateAndStartAnimation =  scene.registerBeforeRender(function()


| Light       | Mô phỏng            | Đặc điểm      |
| ----------- | ------------------- | ------------- |
| Hemispheric | ánh sáng môi trường | mềm           |
| Point       | bóng đèn            | 360°          |
| Directional | mặt trời            | tia song song |
| Spot        | đèn pin             | hình nón      |

| Thuộc tính  | Chức năng            |
| ----------- | -------------------- |
| diffuse     | ánh sáng chính       |
| specular    | ánh sáng phản chiếu  |
| groundColor | ánh sáng từ dưới đất |

 .then((helmet) => {...})
helmet = {
  meshes: [],
  skeletons: [],
  animationGroups: [],
  particleSystems: []
}
npm i -D @babylonjs/core
npm i -D @babylonjs/loaders  
npm i -D @babylonjs/inspector
npm i threejs-gif-texture   
npm install earcut
npm install babylonjs --save

  const spriteManager = new BABYLON.SpriteManager(
    "poiManager",
    "/icons/tool.png",
        20,
        { width: 512, height: 512 },
    scene
  );
   nên để cùng kích cỡ của ảnh không thì nó chỉ lấy 1 phần của bức ảnh (chỉnh width, height )

DynamicTexture:HTML Canvas chạy trong WebGL.
| Tham số                  | Ý nghĩa           |
| ------------------------ | ----------------- |
| `labelTex_${id}`         | tên texture       |
| `{width:512,height:256}` | kích thước canvas |
| `scene`                  | scene Babylon     |
| `true`                   | bật mipmap        |


billboardMode = BILLBOARDMODE_ALL` → luôn quay mặt về camera.



onBeforeRenderObservable là Observable event của BabylonJS được gọi trước mỗi frame render của scene.

clamp()
Nếu value < min  → trả về min
Nếu value > max  → trả về max
Nếu min ≤ value ≤ max → trả về value

| Event       | dùng khi          |
| ----------- | ----------------- |
| POINTERDOWN | detect nhấn chuột |
| POINTERPICK | click object      |

  // sphere.billboardMode=7; //object sẽ tự xoay để luôn nhìn về camera.
| Giá trị | Ý nghĩa             |
| ------- | ------------------- |
| 0       | tắt billboard       |
| 1       | xoay theo X         |
| 2       | xoay theo Y         |
| 4       | xoay theo Z         |
| 7       | xoay theo X + Y + Z | == billboardmode_all


| Feature           | AdvancedDynamicTexture | DynamicTexture |
| ----------------- | ---------------------- | -------------- |
| mục đích          | GUI                    | texture canvas |
| control UI        | ✔                      | ❌              |
| button            | ✔                      | ❌              |
| slider            | ✔                      | ❌              |
| canvas drawing    | ❌                      | ✔              |
| dùng cho material | ❌                      | ✔              |

AdvancedDynamicTexture
→ game UI
GUI system
UI controls
HUD/menu

DynamicTexture
→ texture trên object
canvas texture
draw graphics/text
apply lên mesh

AdvancedDynamicTexture → hệ thống GUI (Text, Button, Panel)
DynamicTexture → texture canvas để vẽ lên material

Name tag enemy (GUI)
AdvancedDynamicTexture
Vẽ logo lên object
DynamicTexture

GUI System :GUI System là hệ thống dùng để tạo giao diện người dùng (User Interface) trong Babylon.js. 
Text
Button
Slider
Panel
Image
Menu
HUD


StackPanel :tạo một container UI trong Babylon.js GUI để xếp các control theo hàng hoặc cột.

sphere
   │
   └── plane
          │
          └── AdvancedDynamicTexture
                  │
                  └── StackPanel
                          │
                          ├── Button
                          ├── Button
                          └── Button





const hdrTexture = CubeTexture.CreateFromPrefilteredData(
  canyon,
  scene
);
PBR :tạo HDR environment texture cho scene 3D. Nó thường được dùng để tạo ánh sáng môi trường (IBL – Image Based Lighting) và reflection cho vật thể.


File .env là HDR environment map đã được prefilter sẵn.

Prefilter giúp:

phản xạ ánh sáng đúng với độ roughness

tối ưu hiệu năng

load HDR environment texture :texture chứa nhiều thông tin ánh sáng hơn ảnh bình thường. 

tạo IBL lighting :kỹ thuật dùng ảnh môi trường để chiếu sáng vật thể. (dùng ảnh để chiếu sáng)

hỗ trợ PBR reflection
Kim loại → phản chiếu mạnh
Nhựa → phản chiếu yếu

Physically Based Rendering (PBR) là kỹ thuật render mô phỏng ánh sáng theo vật lý thực tế. (giúp vật thể phản xạ ánh sáng giống ngoài đời.)

HDR (High Dynamic Range):texture chứa dữ liệu ánh sáng rất lớn.


const result = root.getHierarchyBoundingVectors(true);
const min = result.min;
const max = result.max;
        max (x,y,z)
          ●
         /|
        / |
       /  |
      ●---|
     /    |
    /     |
   ●------●
min

ctrl+ shift + c = inspect element trong F12 

canvas.addEventListener("pointerdown", function (evt) {
  const pickResult = scene.pick(scene.pointerX, scene.pointerY);

  if (pickResult.hit) {
      const pickedMesh = pickResult.pickedMesh;

      console.log("Mesh được chọn:", pickedMesh.name);
      console.log(pickedMesh);

      // Ví dụ: đổi màu để highlight
      if (pickedMesh.material) {
          pickedMesh.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
      }
  }
});

| Function                             | Ý nghĩa                            |
| ------------------------------------ | ---------------------------------- |
| `mesh.getBoundingInfo()`             | bounding của **mesh đó thôi**      |
| `root.getHierarchyBoundingVectors()` | bounding của **toàn bộ hierarchy** |


