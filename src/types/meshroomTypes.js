const meshroomSteps = {
  CameraInit: "CameraInit",
  FeatureExtraction: "FeatureExtraction",
  ImageMatching: "ImageMatching",
  FeatureMatching: "FeatureMatching",
  StructureFromMotion: "StructureFromMotion",
  PrepareDenseScene: "PrepareDenseScene",
  DepthMapFilter: "DepthMapFilter",
  DepthMap: "DepthMap",
  Meshing: "Meshing",
  MeshFiltering: "MeshFiltering",
  Texturing: "Texturing",
  Publish: "Publish",
};

const meshroomResults = {
  StructureFromMotion: ["cloud_and_poses.ply"],
  Meshing: ["mesh.obj"],
};

export { meshroomSteps, meshroomResults };
