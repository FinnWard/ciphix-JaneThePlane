// Intent name: Default Fallback Intent

// as we catch general fallback here we want to guide the user to a useful input
export const fallback = (conv: any) => conv.add(
  'Darn, seems i drifted off. Sorry about that. Where were we? I can help you with the weather forecast or with weather details for your flight!',
);
export default fallback;
