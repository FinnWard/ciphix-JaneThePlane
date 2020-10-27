// Intent name: Default Welcome Intent

// Try and suggest the user to flight or weather subjects
export const welcome = (conv: any) => conv.add(
  'Howdy! You can call me Heather and i know all about your local weather! You can tell me where you are flying too and ill be able to share all the weather info you need!',
);

export default welcome;
