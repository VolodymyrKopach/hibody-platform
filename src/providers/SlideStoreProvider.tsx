'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { ISlideStore } from '@/types/store';
import { SlideStore, SlideStoreFactory } from '@/stores/SlideStore';
import { SlidePreviewService, SlidePreviewServiceFactory } from '@/services/slides/SlidePreviewService';

// === SOLID: DIP - Контекст для залежностей ===
interface SlideStoreContextValue {
  store: ISlideStore;
  previewService: SlidePreviewService;
}

const SlideStoreContext = createContext<SlideStoreContextValue | null>(null);

// === SOLID: SRP - Provider відповідає тільки за надання доступу до Store ===
interface SlideStoreProviderProps {
  children: ReactNode;
  store?: ISlideStore;
  previewService?: SlidePreviewService;
  enableLogging?: boolean;
  enablePersistence?: boolean;
}

export const SlideStoreProvider: React.FC<SlideStoreProviderProps> = ({
  children,
  store,
  previewService,
  enableLogging = true,
  enablePersistence = true
}) => {
  // === SOLID: DIP - Використання залежності через інтерфейс ===
  const storeInstance = store || SlideStoreFactory.create({
    logging: { enabled: enableLogging, level: 'info' },
    persistence: { enabled: enablePersistence, key: 'teachspark-slide-store' }
  });

  const previewServiceInstance = previewService || SlidePreviewServiceFactory.create();

  // === Debug logging ===
  useEffect(() => {
    if (enableLogging) {
      console.log('🏪 [SlideStoreProvider] Store initialized', {
        storeType: storeInstance.constructor.name,
        previewServiceType: previewServiceInstance.constructor.name,
        initialState: storeInstance.getState()
      });
    }
  }, [storeInstance, previewServiceInstance, enableLogging]);

  const contextValue: SlideStoreContextValue = {
    store: storeInstance,
    previewService: previewServiceInstance
  };

  return (
    <SlideStoreContext.Provider value={contextValue}>
      {children}
    </SlideStoreContext.Provider>
  );
};

// === SOLID: ISP - Hook для отримання Store з контексту ===
export const useSlideStoreContext = (): SlideStoreContextValue => {
  const context = useContext(SlideStoreContext);
  
  if (!context) {
    throw new Error('useSlideStoreContext must be used within a SlideStoreProvider');
  }
  
  return context;
};

// === SOLID: ISP - Hook для отримання тільки Store ===
export const useContextSlideStore = (): ISlideStore => {
  const { store } = useSlideStoreContext();
  return store;
};

// === SOLID: ISP - Hook для отримання тільки PreviewService ===
export const useSlidePreviewService = (): SlidePreviewService => {
  const { previewService } = useSlideStoreContext();
  return previewService;
};

// === SOLID: OCP - Розширений Provider з додатковими сервісами ===
interface ExtendedSlideStoreProviderProps extends SlideStoreProviderProps {
  onStoreReady?: (store: ISlideStore) => void;
  onError?: (error: Error) => void;
}

export const ExtendedSlideStoreProvider: React.FC<ExtendedSlideStoreProviderProps> = ({
  children,
  onStoreReady,
  onError,
  ...props
}) => {
  return (
    <SlideStoreProvider {...props}>
      <StoreInitializer onReady={onStoreReady} onError={onError} />
      {children}
    </SlideStoreProvider>
  );
};

// === Helper component для ініціалізації ===
const StoreInitializer: React.FC<{
  onReady?: (store: ISlideStore) => void;
  onError?: (error: Error) => void;
}> = ({ onReady, onError }) => {
  const { store } = useSlideStoreContext();

  useEffect(() => {
    try {
      // Підписуємося на зміни для логування
      const unsubscribe = store.subscribe((newState, prevState) => {
        console.log('🔄 [SlideStore] State changed', {
          changedFields: Object.keys(newState).filter(key => 
            newState[key as keyof typeof newState] !== prevState[key as keyof typeof prevState]
          ),
          slideCount: newState.slides.length,
          lessonTitle: newState.currentLesson?.title
        });
      });

      onReady?.(store);

      return unsubscribe;
    } catch (error) {
      onError?.(error as Error);
    }
  }, [store, onReady, onError]);

  return null;
};

// === SOLID: SRP - HOC для компонентів що потребують Store ===
export function withSlideStore<P extends object>(
  Component: React.ComponentType<P & { store: ISlideStore }>
) {
  return function WithSlideStoreComponent(props: P) {
    const store = useContextSlideStore();
    
    return <Component {...props} store={store} />;
  };
}

// === SOLID: SRP - HOC для компонентів що потребують PreviewService ===
export function withSlidePreview<P extends object>(
  Component: React.ComponentType<P & { previewService: SlidePreviewService }>
) {
  return function WithSlidePreviewComponent(props: P) {
    const previewService = useSlidePreviewService();
    
    return <Component {...props} previewService={previewService} />;
  };
}

// === Development helpers ===
export const SlideStoreDevTools: React.FC = () => {
  const { store, previewService } = useSlideStoreContext();
  const [showDevTools, setShowDevTools] = React.useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const state = store.getState();

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 10000,
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <button onClick={() => setShowDevTools(!showDevTools)}>
        🛠️ SlideStore DevTools
      </button>
      
      {showDevTools && (
        <div style={{ marginTop: '10px', maxWidth: '300px' }}>
          <div><strong>Slides:</strong> {state.slides.length}</div>
          <div><strong>Selected:</strong> {state.selectedSlides.size}</div>
          <div><strong>Previews:</strong> {Object.keys(state.slidePreviews).length}</div>
          <div><strong>Panel Open:</strong> {state.slidePanelOpen ? 'Yes' : 'No'}</div>
          <div><strong>Generating:</strong> {state.isGenerating ? 'Yes' : 'No'}</div>
          <div><strong>Preview Cache:</strong> {previewService.getCacheSize()}</div>
          
          <button 
            onClick={() => store.actions.reset()}
            style={{ marginTop: '5px', padding: '2px 5px' }}
          >
            Reset Store
          </button>
        </div>
      )}
    </div>
  );
}; 