'use client'

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { containsChinese } from '@/lib/data-filter';

interface ChineseDetectorProps {
  children: React.ReactNode;
}

/**
 * Chinese character detector - detects Chinese characters in English mode during development
 */
export function ChineseDetector({ children }: ChineseDetectorProps) {
  const locale = useLocale();
  
  useEffect(() => {
    if (locale === 'en' && process.env.NODE_ENV === 'development') {
      // Delay check to ensure DOM is rendered
      const checkTimer = setTimeout(() => {
        checkForChineseText();
      }, 1000);
      
      return () => clearTimeout(checkTimer);
    }
  }, [locale]);
  
  const checkForChineseText = () => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script and style tags
          const parent = node.parentElement;
          if (parent && ['SCRIPT', 'STYLE'].includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    const chineseTexts: string[] = [];
    let node: Node | null;
    
    while (node = walker.nextNode()) {
      const textContent = node.textContent?.trim();
      if (textContent && containsChinese(textContent)) {
        chineseTexts.push(textContent);
      }
    }
    
    if (chineseTexts.length > 0) {
      console.group('🚨 Chinese text detected in English mode:');
      chineseTexts.forEach((text, index) => {
        console.warn(`${index + 1}. "${text}"`);
      });
      console.groupEnd();
      
      // Show warning banner at top of page
      showWarningBanner(chineseTexts.length);
    } else {
      console.log('✅ No Chinese text detected in English mode');
    }
  };
  
  const showWarningBanner = (count: number) => {
    // Remove existing warning
    const existingWarning = document.getElementById('chinese-warning-banner');
    if (existingWarning) {
      existingWarning.remove();
    }
    
    // Create warning banner
    const banner = document.createElement('div');
    banner.id = 'chinese-warning-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ef4444;
      color: white;
      padding: 8px 16px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    banner.innerHTML = `
      ⚠️ WARNING: ${count} Chinese text(s) detected in English mode! Check console for details.
      <button onclick="this.parentElement.remove()" style="margin-left: 16px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Close</button>
    `;
    
    document.body.prepend(banner);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      banner.remove();
    }, 5000);
  };
  
  return <>{children}</>;
}