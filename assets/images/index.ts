// Image assets for PhylloZinc Mobile
// All images are imported from the phyllo-zinc website's public folder

// Logo and branding
export const PhyllozincLogo = require('./phyllozinc.png');
export const Logo = require('./Logo.png');

// Team member photos
export const TeamImages = {
  paksofi: require('./paksofi.png'),
  catherine: require('./catherine.jpg'),
  zahwa: require('./zahwa.jpg'),
  jesslyn: require('./jesslyn.jpg'),
  rona: require('./rona.jpg'),
  rizal: require('./rizal.jpg'),
};

// Background/hero images
export const BackgroundImages = {
  grassland: require('./grassland.jpg'),
  livestock: require('./livestock.jpg'),
  methane: require('./methane.jpg'),
  meniran: require('./meniran.jpg'),
  zinc: require('./zinc.jpg'),
};

// Virtual Lab equipment images
export const LabEquipmentImages = {
  beaker: require('./beaker.png'),
  grinder: require('./grinder.png'),
  hotplate: require('./hotplate.png'),
  filterpaper: require('./filterpaper.png'),
  solvent: require('./solvent.png'),
  meniranleaves: require('./meniranleaves.png'),
  finalproduct: require('./finalproduct.png'),
  vlab: require('./beaker_illustration.png'),
};

// Map team member image filename to actual require
export const getTeamMemberImage = (imageName: string) => {
  const imageMap: Record<string, any> = {
    'paksofi.png': TeamImages.paksofi,
    'catherine.jpg': TeamImages.catherine,
    'zahwa.jpg': TeamImages.zahwa,
    'jesslyn.jpg': TeamImages.jesslyn,
    'rona.jpg': TeamImages.rona,
    'rizal.jpg': TeamImages.rizal,
  };
  return imageMap[imageName] || null;
};
