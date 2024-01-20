const colmapOpenMvsResultPaths = {
  model_converter: "StructureFromMotion/sparse/0/sfm.ply",
  DenseReconstruction: "openMVS/DensifyPointCloud/model_dense.ply",
  ReconstructMesh: "openMVS/ReconstructMesh/model_dense_mesh.ply",
};
const colmapOpenMvsResult = {
  model_converter: ["sfm.ply"],
  DenseReconstruction: ["model_dense.ply"],
  ReconstructMesh: ["model_dense_mesh.ply"],
  TextureMesh: ["model.obj", "model.mtl"],
};
const colmapOpenMvsSteps = {
  feature_extractor: "feature_extractor",
  exhaustive_matcher: "exhaustive_matcher",
  mapper: "mapper",
  image_undistorter: "image_undistorter",
  model_converter: "model_converter",
  InterfaceCOLMAP: "InterfaceCOLMAP",
  DensifyPointCloud: "DensifyPointCloud",
  ReconstructMesh: "ReconstructMesh",
  RefineMesh: "RefineMesh",
  TextureMesh: "TextureMesh",
};

export { colmapOpenMvsResultPaths, colmapOpenMvsResult, colmapOpenMvsSteps };
