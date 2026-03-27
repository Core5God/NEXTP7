import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;

// 1. Try to find an existing root in global property
let root = (window as any)._reactRoot;

// 2. If we don't have the root object, but the element looks like it's already a React root,
// we MUST replace the element to clear React's internal state, otherwise createRoot will warn/fail.
const hasReactContainer = 
  Object.getOwnPropertyNames(rootElement).some(prop => prop.startsWith('__reactContainer')) ||
  Object.getOwnPropertySymbols(rootElement).some(sym => sym.toString().includes('__reactContainer'));

if (hasReactContainer && !root) {
  try {
    const newRootElement = rootElement.cloneNode(false) as HTMLElement;
    rootElement.parentNode?.replaceChild(newRootElement, rootElement);
    root = createRoot(newRootElement);
    (window as any)._reactRoot = root;
  } catch (e) {
    console.error('Failed to reset React root element:', e);
  }
} else if (!root) {
  try {
    root = createRoot(rootElement);
    (window as any)._reactRoot = root;
  } catch (e) {
    console.warn('createRoot failed, attempting emergency reset:', e);
    const newRootElement = rootElement.cloneNode(false) as HTMLElement;
    rootElement.parentNode?.replaceChild(newRootElement, rootElement);
    root = createRoot(newRootElement);
    (window as any)._reactRoot = root;
  }
}

if (root) {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
