import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">About This Application</h1>
      <p className="text-gray-700">This is a simple LLM PDF Chatbot Interface.</p>
      <p className="text-gray-700 mt-2">More details about the application can go here.</p>
    </div>
  );
};

export default AboutPage;
