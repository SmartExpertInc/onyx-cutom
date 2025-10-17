"use client";

import { Calendar, ExternalLink, CreditCard, Bell, Users, Settings, Key, Home, HardDrive, FileText, ClipboardCheck, Upload, Trash2, FolderPlus, Search, Presentation, X, Database, Coins, Workflow, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddOnsModal from '@/components/AddOnsModal';
import TariffPlanModal from '@/components/ui/tariff-plan-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import useFeaturePermission from '@/hooks/useFeaturePermission';

const Sidebar = ({ currentTab, onFolderSelect, selectedFolderId, folders, folderProjects }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [folderSearch, setFolderSearch] = useState('');
  const { isEnabled: aiAuditEnabled } = useFeaturePermission('ai_audit_templates');
  const { isEnabled: deloitteBannerEnabled } = useFeaturePermission('deloitte_banner');
  const { isEnabled: offersTabEnabled } = useFeaturePermission('offers_tab');
  const { isEnabled: workspaceTabEnabled } = useFeaturePermission('workspace_tab');
  const { isEnabled: exportToLMSEnabled } = useFeaturePermission('export_to_lms');
  const { isEnabled: eventPostersEnabled } = useFeaturePermission('event_posters');

  // Check if any modal is open
  const isModalOpen = getModalState();

  // Get the 5 newest folders
  const getNewestFolders = (folders) => {
    return folders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  // Filter folders based on search
  const getFilteredFolders = (folders) => {
    if (!folderSearch.trim()) {
      return getNewestFolders(folders);
    }
    
    const searchTerm = folderSearch.toLowerCase();
    return folders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm)
    );
  };

  const handleDragOver = (e) => {
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, folderId) => {
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-100', 'border-2', 'border-blue-300', 'scale-105');
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'project') {
        window.dispatchEvent(new CustomEvent('moveProjectToFolder', {
          detail: { projectId: data.projectId, folderId }
        }));
      } else if (data.type === 'folder') {
        window.dispatchEvent(new CustomEvent('moveFolderToFolder', {
          detail: { folderId: data.folderId, targetParentId: folderId }
        }));
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const handleDragEnter = (e) => {
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-100', 'border-2', 'border-blue-300', 'scale-105', 'shadow-lg');
  };

  const handleDragLeave = (e) => {
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('bg-blue-100', 'border-2', 'border-blue-300', 'scale-105', 'shadow-lg');
    }
  };

  const filteredFolders = getFilteredFolders(folders);
  const isSearching = folderSearch.trim().length > 0;

  return (
    <aside className="w-64 bg-[#EEEEEE] p-4 flex flex-col fixed h-full border-r border-gray-200 text-sm z-40">
      <div className="relative mb-6">
        {deloitteBannerEnabled ? (
          <div className="w-full rounded-lg shadow-sm border border-gray-200 px-4 py-2 gap-2 flex items-center justify-center">
            <svg height="20" viewBox="17.086 17.192 885.828 165.617" width="163" xmlns="http://www.w3.org/2000/svg">
              <path d="m855.963 159.337c0-12.962 10.524-23.478 23.479-23.478 12.962 0 23.472 10.516 23.472 23.478s-10.51 23.472-23.472 23.472c-12.955 0-23.479-10.51-23.479-23.472" fill="#86bc24" />
              <path d="m107.195 97.16c0-14.871-2.873-25.904-8.62-33.092-5.755-7.18-14.47-10.767-26.19-10.767h-12.465v90.938h9.538c13.016 0 22.554-3.86 28.628-11.604 6.066-7.73 9.11-19.558 9.11-35.475m44.456-1.55c0 27.093-7.282 47.97-21.848 62.623-14.565 14.66-35.04 21.99-61.434 21.99h-51.284v-162.343h54.865c25.448 0 45.095 6.665 58.94 19.987 13.839 13.329 20.761 32.568 20.761 57.745m142.058 84.61h40.808v-163.024h-40.808zm98.137-60.809c0 10.394 1.358 18.322 4.07 23.77 2.717 5.456 7.268 8.18 13.667 8.18 6.332 0 10.809-2.724 13.418-8.18 2.608-5.448 3.906-13.376 3.906-23.77 0-10.34-1.318-18.139-3.96-23.403-2.65-5.28-7.168-7.922-13.574-7.922-6.264 0-10.74 2.63-13.458 7.86-2.71 5.238-4.07 13.057-4.07 23.465m76.597 0c0 19.803-5.19 35.252-15.598 46.325-10.4 11.08-24.959 16.624-43.675 16.624-17.948 0-32.235-5.666-42.84-16.998-10.618-11.331-15.924-26.644-15.924-45.95 0-19.743 5.198-35.083 15.605-46.02 10.407-10.938 25-16.406 43.79-16.406 11.611 0 21.883 2.534 30.782 7.595 8.906 5.06 15.782 12.31 20.612 21.753 4.837 9.429 7.248 20.462 7.248 33.077m16.207 60.809h40.815v-121.094h-40.815zm-.002-135.742h40.816v-27.288h-40.816zm123.507 104.856c5.51 0 12.072-1.4 19.728-4.178v30.469c-5.503 2.418-10.734 4.15-15.707 5.176-4.972 1.04-10.808 1.556-17.486 1.556-13.703 0-23.58-3.444-29.647-10.32-6.04-6.874-9.069-17.431-9.069-31.677v-49.92h-14.294v-31.303h14.294v-30.925l41.128-7.153v38.077h26.04v31.305h-26.04v47.133c0 7.84 3.689 11.76 11.053 11.76m94.461 0c5.51 0 12.073-1.4 19.729-4.178v30.469c-5.496 2.418-10.734 4.15-15.707 5.176-4.98 1.04-10.794 1.556-17.486 1.556-13.702 0-23.58-3.444-29.634-10.32-6.052-6.874-9.082-17.431-9.082-31.677v-49.92h-14.3v-31.303h14.3v-31.393l41.12-6.685v38.077h26.054v31.305h-26.053v47.133c0 7.84 3.689 11.76 11.06 11.76m71.227-44.675c.557-6.63 2.453-11.488 5.686-14.592 3.248-3.098 7.256-4.647 12.052-4.647 5.231 0 9.389 1.739 12.473 5.244 3.104 3.485 4.721 8.153 4.85 13.995zm57.555-33.397c-9.702-9.51-23.465-14.273-41.27-14.273-18.717 0-33.12 5.469-43.215 16.406-10.088 10.938-15.135 26.63-15.135 47.08 0 19.802 5.455 35.074 16.338 45.794 10.89 10.72 26.182 16.087 45.876 16.087 9.457 0 17.596-.645 24.416-1.929 6.78-1.27 13.343-3.567 19.709-6.882l-6.271-27.29c-4.626 1.89-9.028 3.343-13.186 4.3-6.005 1.394-12.595 2.093-19.77 2.093-7.866 0-14.075-1.922-18.627-5.767-4.552-3.852-6.977-9.165-7.255-15.931h72.948v-18.594c0-17.887-4.85-31.59-14.558-41.094m-625.583 33.397c.557-6.63 2.453-11.488 5.686-14.592 3.24-3.098 7.255-4.647 12.059-4.647 5.217 0 9.375 1.739 12.466 5.244 3.104 3.485 4.714 8.153 4.857 13.995zm57.561-33.397c-9.708-9.51-23.465-14.273-41.277-14.273-18.723 0-33.118 5.469-43.207 16.406-10.088 10.938-15.142 26.63-15.142 47.08 0 19.802 5.448 35.074 16.345 45.794 10.883 10.72 26.175 16.087 45.87 16.087 9.456 0 17.595-.645 24.415-1.929 6.78-1.27 13.343-3.567 19.715-6.882l-6.277-27.29c-4.627 1.89-9.029 3.343-13.18 4.3-6.018 1.394-12.601 2.093-19.776 2.093-7.86 0-14.075-1.922-18.627-5.767-4.559-3.852-6.977-9.165-7.255-15.931h72.948v-18.594c0-17.887-4.85-31.59-14.552-41.094" fill="#0f0b0b" />
            </svg>
          </div>
        ) : (
          <div className="rounded-lg shadow-sm border border-gray-200 px-4 py-2 gap-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M12.6963 11.831L10.5205 10.4425C10.7998 9.65925 10.7368 8.78439 10.3321 8.04194L12.1168 6.47327C13.0972 7.07503 14.4037 6.95757 15.256 6.11902C16.248 5.143 16.248 3.56044 15.256 2.58438C14.2639 1.60832 12.6553 1.60832 11.6633 2.58438C10.8818 3.35329 10.7164 4.4981 11.1659 5.42681L9.38103 6.99572C8.52665 6.41397 7.43676 6.31227 6.50015 6.69182L4.44195 3.90514C5.18026 2.95143 5.10743 1.58407 4.22185 0.712658C3.25607 -0.237553 1.69021 -0.237553 0.724374 0.712658C-0.241458 1.66292 -0.241458 3.20358 0.724374 4.15379C1.41786 4.8361 2.42044 5.02835 3.28829 4.73105L5.34675 7.51798C4.33025 8.69104 4.38442 10.4545 5.5115 11.5633C5.53315 11.5846 5.55541 11.6046 5.57772 11.6252L3.58345 15.0689C2.75458 14.8761 1.84648 15.0971 1.20005 15.7332C0.207993 16.7093 0.207993 18.292 1.20005 19.268C2.1921 20.244 3.80065 20.244 4.79266 19.268C5.77434 18.3022 5.78405 16.7428 4.82279 15.7645L6.81691 12.3211C7.81832 12.604 8.93798 12.37 9.74277 11.6194L11.9207 13.0089C11.7816 13.6442 11.9624 14.3339 12.4642 14.8276C13.2504 15.601 14.5247 15.601 15.3107 14.8276C16.0968 14.0542 16.0968 12.8004 15.3107 12.027C14.598 11.326 13.4839 11.2606 12.6963 11.831ZM2.06068 16.9455C2.01235 16.9994 1.96687 17.0503 1.92225 17.0941C1.86665 17.1488 1.79068 17.2154 1.69641 17.244C1.57799 17.28 1.45699 17.2483 1.36425 17.1571C1.12173 16.9185 1.21448 16.4671 1.58003 16.1076C1.94568 15.7479 2.40428 15.6566 2.64689 15.8953C2.73958 15.9864 2.77175 16.1055 2.73516 16.2221C2.70609 16.3148 2.6384 16.3898 2.58286 16.4443C2.53824 16.4881 2.4865 16.5328 2.43167 16.5804C2.3684 16.6352 2.30284 16.6918 2.2383 16.7552C2.17381 16.8187 2.11633 16.8832 2.06068 16.9455ZM12.0433 2.95853C12.4088 2.59888 12.8675 2.50753 13.11 2.74618C13.2027 2.83733 13.235 2.95643 13.1983 3.07303C13.1692 3.16583 13.1015 3.24073 13.046 3.29534C13.0015 3.33909 12.9498 3.38384 12.8949 3.43134C12.8315 3.48619 12.7661 3.54279 12.7015 3.60624C12.6369 3.66979 12.5794 3.73434 12.5236 3.79664C12.4755 3.85044 12.4298 3.90149 12.3854 3.94529C12.3299 3.99994 12.2537 4.06654 12.1595 4.09519C12.0409 4.13114 11.92 4.09949 11.8273 4.00824C11.5849 3.76959 11.6777 3.31814 12.0433 2.95853ZM1.56229 1.89272C1.51513 1.94522 1.47087 1.99482 1.42772 2.03747C1.3737 2.09062 1.2996 2.15537 1.20772 2.18342C1.09241 2.21832 0.974611 2.18757 0.884304 2.09887C0.648195 1.86652 0.738654 1.42707 1.0946 1.07696C1.45049 0.726758 1.89694 0.637857 2.13315 0.870209C2.22341 0.95901 2.25486 1.07496 2.21914 1.18836C2.19063 1.27871 2.12492 1.35161 2.07085 1.40466C2.02745 1.44737 1.97703 1.49102 1.92367 1.53707C1.86203 1.59037 1.7982 1.64557 1.73543 1.70737C1.67257 1.76922 1.61641 1.83212 1.56229 1.89272ZM5.96558 7.78808C6.40227 7.35838 6.95001 7.24938 7.23979 7.53443C7.35057 7.64348 7.38904 7.78563 7.34539 7.92493C7.31042 8.03584 7.22967 8.12519 7.1633 8.19054C7.11009 8.24289 7.04819 8.29614 6.98274 8.35294C6.90722 8.41849 6.82896 8.48604 6.75181 8.56189C6.67467 8.63784 6.60596 8.71479 6.53949 8.78924C6.48176 8.85359 6.42743 8.91449 6.37427 8.96674C6.3079 9.03224 6.21709 9.11155 6.10437 9.14585C5.96289 9.1888 5.81835 9.15105 5.70741 9.042C5.41784 8.75669 5.52888 8.21779 5.96558 7.78808ZM13.0368 13.1053C12.9927 13.1486 12.9323 13.2014 12.8577 13.2241C12.7639 13.2525 12.6682 13.2275 12.5946 13.1552C12.4023 12.9662 12.4758 12.6086 12.7656 12.3236C13.0551 12.0386 13.4186 11.9663 13.6108 12.1555C13.6841 12.2276 13.7097 12.322 13.6807 12.4144C13.6577 12.488 13.604 12.5472 13.56 12.5905C13.5248 12.6251 13.4838 12.6606 13.4404 12.6982C13.3904 12.7415 13.3383 12.7865 13.2872 12.8368C13.2361 12.8871 13.1903 12.9381 13.1464 12.9876C13.1081 13.0303 13.072 13.0706 13.0368 13.1053Z" fill="#0F58F9"/>
            </svg>
            <span className="font-black text-[#0F58F9] text-base">ContentBuilder</span>
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-1">
        <Link
          href="/projects"
          className={`flex text-sm font-semibold items-center gap-3 p-2 rounded-lg ${currentTab === 'products' && selectedFolderId === null ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'hover:bg-gray-100 text-gray-900'}`}
          onClick={() => onFolderSelect(null)}
        >
          <Home size={18} strokeWidth={1.5} className='font-normal' />
          {/* <span>{t('interface.products', 'Products')}</span> */}
          <span>{t('interface.home', 'Home')}</span>
        </Link>
        <Link
          href="/projects?tab=my-products"
          onClick={() => {
            trackPageView("My products");
            onFolderSelect(null);
          }}
          className={`flex text-sm font-semibold items-center gap-3 p-2 rounded-lg ${currentTab === 'my-products' ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'hover:bg-gray-100 text-gray-900'}`}
        >
          <FolderOpen size={18} strokeWidth={1.5} className='font-normal' />
          <span>{t('interface.myProducts', 'My products')}</span>
        </Link>
        <Link
          href="/projects?tab=smart-drive"
          className={`flex text-sm font-semibold items-center gap-3 p-2 rounded-lg ${currentTab === 'smart-drive' ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'hover:bg-gray-100 text-gray-900'}`}
          onClick={() => {
            trackPageView("Smart Drive");
            onFolderSelect(null);
          }}
        >
          <BookCopy size={18} strokeWidth={1.5} className='font-normal' />
          {/* <span>{t('interface.smartDrive', 'Smart Drive')}</span> */}
          <span>{t('interface.knowledgeBase', 'Knowledge base')}</span>
        </Link>
        {offersTabEnabled && (
          <Link
            href="/projects?tab=offers"
            className={`flex text-sm font-semibold items-center gap-3 p-2 rounded-lg ${currentTab === 'offers' ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'hover:bg-gray-100 text-gray-900'}`}
            onClick={() => {
            trackPageView("Offers");
            onFolderSelect(null);
          }}
          >
            <FileText size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.offers', 'Offers')}</span>
          </Link>
        )}
        {aiAuditEnabled && (
          <Link
            href="/projects?tab=audits"
            className={`flex text-sm font-semibold items-center gap-3 p-2 rounded-lg ${currentTab === 'audits' ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'hover:bg-gray-100 text-gray-900'}`}
            onClick={() => onFolderSelect(null)}
          >
            <ClipboardCheck size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.audits', 'Audits')}</span>
          </Link>
        )}
        {workspaceTabEnabled && (
          <Link
            href="/projects?tab=workspace"
            className={`flex text-sm font-semibold items-center gap-3 p-2 rounded-lg ${currentTab === 'workspace' ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'hover:bg-gray-100 text-gray-900'}`}
            onClick={() => onFolderSelect(null)}
          >
            <Users size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.workspace', 'Workspace')}</span>
          </Link>
        )}
        {exportToLMSEnabled && (
          <Link
            href="/projects?tab=export-lms"
            className={`flex text-sm font-semibold items-center gap-3 p-2 rounded-lg ${currentTab === 'export-lms' ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'hover:bg-gray-100 text-gray-900'}`}
            onClick={() => {
            trackPageView("Export to LMS");
            onFolderSelect(null);
          }}
          >
            <Upload size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.exportToLMS', 'Export to LMS')}</span>
          </Link>
        )}
      </nav>
      <nav className="flex flex-col gap-1 mt-auto">
        {eventPostersEnabled && (
          <Link href="/create/event-poster/questionnaire" className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900">
            <Presentation size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.eventPoster', 'Event Poster')}</span>
          </Link>
        )}
        <Link href="/projects?tab=trash" className={`flex text-sm font-semibold items-center gap-3 p-2 rounded-lg ${currentTab === 'trash' ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'hover:bg-gray-100 text-gray-900'}`}>
          <Trash2 size={18} strokeWidth={1.5} className='font-normal' />
          <span>{t('interface.trash', 'Trash')}</span>
        </Link>
      </nav>
    </aside>
  );
};

const Header = ({ isTrash, isSmartDrive, isOffers, isAudits, isMyProducts, isWorkspace, isExportLMS, workspaceData, onTariffModalOpen, onAddOnsModalOpen }) => {
  const [userCredits, setUserCredits] = useState(null);
  const { t } = useLanguage();

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Fetch user credits on component mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/credits/me`, {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const credits = await response.json();
          setUserCredits(credits.credits_balance);
        }
      } catch (error) {
        console.error('Failed to fetch user credits:', error);
        // Keep userCredits as null to show loading state
      }
    };

    fetchUserCredits();
  }, []);

  const getHeaderTitle = () => {
    if (isTrash) return t('interface.trash', 'Trash');
    if (isSmartDrive) return t('interface.knowledgeBase', 'Knowledge base');
    if (isOffers) return t('interface.offers', 'Offers');
    if (isAudits) return t('interface.audits', 'Audits');
    if (isMyProducts) return t('interface.myProducts', 'My products');
    if (isWorkspace) {
      return workspaceData?.name || t('interface.workspace', 'Workspace');
    }
    if (isExportLMS) return t('interface.exportToLMS', 'Export to LMS');
    return t('interface.home', 'Home');
  };

  return (
    <header className="flex items-center justify-between p-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
      <h1 className="text-3xl font-semibold text-gray-900">{getHeaderTitle()}</h1>
      <div className="flex items-center gap-4">
        <Button variant="download" className="bg-[#D8FDF9] hover:bg-[#CEF2EF]/90 text-[#06A294] flex items-center gap-2 rounded-md font-bold public-sans text-xs" onClick={onTariffModalOpen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <g clip-path="url(#clip0_308_17348)">
          <path d="M12.3176 11.7968C11.8825 11.9633 11.6458 12.2012 11.4774 12.6356C11.3107 12.2012 11.0724 11.9649 10.6372 11.7968C11.0724 11.6303 11.3091 11.394 11.4774 10.9579C11.6442 11.3924 11.8825 11.6287 12.3176 11.7968ZM11.5382 4.99568C11.9153 3.5935 12.4306 3.07794 13.8366 2.70096C12.4322 2.3245 11.9158 1.81001 11.5382 0.40625C11.1611 1.80843 10.6458 2.32399 9.23981 2.70096C10.6442 3.07743 11.1606 3.59192 11.5382 4.99568ZM11.9486 7.88981C11.9486 7.7577 11.8798 7.5982 11.6872 7.5445C10.1118 7.10467 9.12471 6.60253 8.38772 5.86735C7.65079 5.13161 7.14678 4.14608 6.70788 2.57315C6.65409 2.38089 6.49433 2.31215 6.36201 2.31215C6.22969 2.31215 6.06993 2.38089 6.01615 2.57315C5.57561 4.14608 5.07266 5.13155 4.33631 5.86735C3.5983 6.60418 2.61227 7.1063 1.03681 7.5445C0.844242 7.5982 0.775391 7.75771 0.775391 7.88981C0.775391 8.02192 0.844242 8.18143 1.03681 8.23513C2.61227 8.67496 3.59932 9.1771 4.33631 9.91227C5.07431 10.6491 5.57725 11.6335 6.01615 13.2065C6.06994 13.3987 6.2297 13.4675 6.36201 13.4675C6.49434 13.4675 6.6541 13.3987 6.70788 13.2065C7.14842 11.6335 7.65137 10.6481 8.38772 9.91227C9.12573 9.17545 10.1118 8.67332 11.6872 8.23513C11.8798 8.18142 11.9486 8.02192 11.9486 7.88981Z" fill="#06A294"/>
          </g>
          <defs>
          <clipPath id="clip0_308_17348">
          <rect width="14.6939" height="14.6939" fill="white" transform="translate(0.775391 0.407227)"/>
          </clipPath>
          </defs>
        </svg>
            {t("interface.getUnlimitedAI", "Get Unlimited AI")}</Button>
        <button 
          onClick={onAddOnsModalOpen}
          className="flex items-center gap-2 bg-[#F7E0FC] hover:bg-[#EBD5F0]/90 text-sm font-bold text-[#8808A2] px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
        >
          <Coins strokeWidth={1.5} size={16} className="font-normal text-[#8808A2]" />
          {userCredits !== null ? `${userCredits} ${t('interface.courseOutline.credits', 'Credits')}` : t('interface.loading', 'Loading...')}
        </button>
        {/* <Button variant="outline" onClick={onSurveyModalOpen}>
          <MessageSquare size={16} className="mr-2" />
          Survey
        </Button> */}
        <Bell size={20} className="text-gray-600 cursor-pointer" />
        <LanguageDropdown />
        <UserDropdown />
      </div>
    </header>
  );
};

export default function BillingPage() {
  const [isAddonsModalOpen, setIsAddonsModalOpen] = useState(false);
  const [isTariffPlanModalOpen, setIsTariffPlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);
  const [billingInfo, setBillingInfo] = useState({ plan: 'starter', status: 'inactive', interval: null, priceId: null, subscriptionId: null });
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderProjects, setFolderProjects] = useState({});
  const { t } = useLanguage();
  const currentTab = 'payments';

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const res = await fetch('/api/custom-projects-backend/billing/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          setBillingInfo(data);
        }
      } catch (e) {
        console.error('Failed to load billing info', e);
      }
    };
    loadBilling();
  }, []);

  const purchasedItems = [
    {
      type: 'connectors',
      name: '5 Connectors',
      amount: '5 connectors',
      price: 25,
      priceNote: 'per month',
      purchaseDate: '2025-09-10'
    },
    {
      type: 'storage',
      name: '5 GB Storage',
      amount: '5 GB storage',
      price: 150,
      priceNote: 'per month',
      purchaseDate: '2025-09-01'
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'connectors':
        return <Workflow className="w-6 h-6" />;
      case 'storage':
        return <Server className="w-6 h-6" />;
      default:
        return null;
    }
  };
  
  // Plan configuration with colors and styling - easily manageable
  const planConfig = {
    starter: {
      name: 'Starter',
      type: 'Free',
      price: '$0',
      bgGradient: 'from-slate-700 via-slate-800 to-slate-900',
      textColor: 'text-white',
      buttonTextColor: 'text-white',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      buttonShadow: 'shadow-blue-600/30',
      isCurrent: true,
      credits: t('tariffPlan.plans.starter.credits', '200 (one-time on registration)'),
      storage: t('tariffPlan.plans.starter.storage', '1 GB'),
      support: t('tariffPlan.plans.starter.support', 'Email up to 48 hours'),
      connectors: 'None',
      collaboration: 'None',
      features: [
        t('tariffPlan.plans.starter.credits', '200 (one-time on registration)'),
        t('tariffPlan.plans.starter.storage', '1 GB'),
        t('tariffPlan.plans.starter.support', 'Email up to 48 hours'),
        'No connectors',
        'No collaboration'
      ]
    },
    pro: {
      name: 'Pro',
      type: 'Monthly',
      price: '$30',
      bgGradient: 'from-blue-400 via-blue-500 to-blue-600',
      textColor: 'text-white',
      buttonTextColor: 'text-white',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      buttonShadow: 'shadow-blue-600/30',
      isCurrent: false,
      credits: t('tariffPlan.plans.pro.credits', '600 / month'),
      storage: t('tariffPlan.plans.pro.storage', '5 GB'),
      support: t('tariffPlan.plans.pro.support', 'Email up to 24 hours'),
      connectors: '2',
      collaboration: '1 (up to 3 participants)',
      features: [
        t('tariffPlan.plans.pro.features.0', '600 credits per month'),
        t('tariffPlan.plans.pro.features.1', '5 GB storage'),
        t('tariffPlan.plans.pro.support', 'Email up to 24 hours'),
        t('tariffPlan.plans.pro.features.3', '2 platform connectors'),
        t('tariffPlan.plans.pro.features.4', 'Team collaboration (up to 3)')
      ]
    },
    business: {
      name: 'Business',
      type: 'Monthly',
      price: '$90',
      bgGradient: 'from-blue-500 via-blue-600 to-blue-700',
      textColor: 'text-white',
      buttonTextColor: 'text-blue-700',
      buttonColor: 'bg-blue-300 hover:bg-blue-400',
      buttonShadow: 'shadow-blue-300/30',
      isCurrent: false,
      credits: t('tariffPlan.plans.business.credits', '2,000 / month'),
      storage: t('tariffPlan.plans.business.storage', '10 GB'),
      support: t('tariffPlan.plans.business.support', 'Priority support'),
      connectors: '5',
      collaboration: t('tariffPlan.plans.business.collaboration', '3 (up to 10 participants)'),
      features: [
        t('tariffPlan.plans.business.features.0', '2,000 credits per month'),
        t('tariffPlan.plans.business.features.1', '10 GB storage'),
        t('tariffPlan.plans.business.features.2', 'Priority support'),
        t('tariffPlan.plans.business.features.3', '5 platform connectors'),
        t('tariffPlan.plans.business.features.4', 'Team collaboration (up to 10)')
      ]
    },
    enterprise: {
      name: 'Enterprise',
      type: 'Custom',
      price: 'Custom',
      bgGradient: 'from-indigo-600 via-indigo-700 to-indigo-800',
      textColor: 'text-white',
      buttonTextColor: 'text-indigo-800',
      buttonColor: 'bg-indigo-400 hover:bg-indigo-500',
      buttonShadow: 'shadow-indigo-400/30',
      isCurrent: false,
      credits: t('tariffPlan.plans.enterprise.credits', '10,000+ / month (flexible)'),
      storage: t('tariffPlan.plans.enterprise.storage', '50 GB + pay-as-you-go'),
      support: t('tariffPlan.plans.enterprise.support', 'Dedicated manager'),
      connectors: t('tariffPlan.plans.enterprise.connectors', 'All'),
      collaboration: t('tariffPlan.plans.enterprise.collaboration', 'Unlimited'),
      features: [
        t('tariffPlan.plans.enterprise.features.0', 'Custom credit allocation'),
        t('tariffPlan.plans.enterprise.features.1', 'Unlimited storage'),
        t('tariffPlan.plans.enterprise.features.2', 'Dedicated account manager'),
        t('tariffPlan.plans.enterprise.features.3', 'All platform connectors'),
        t('tariffPlan.plans.enterprise.features.4', 'Unlimited team collaboration'),
        t('tariffPlan.plans.enterprise.features.5', 'Custom features & integrations')
      ]
    }
  };

  // Current plan (dynamically determined by isCurrent property)
  const currentPlan = (() => {
    const key = (billingInfo.plan || 'starter').toLowerCase();
    if (key.includes('business')) return planConfig.business;
    if (key.includes('pro')) return planConfig.pro;
    if (key.includes('enterprise')) return planConfig.enterprise;
    return planConfig.starter;
  })();
  const displayType = (() => {
    if (billingInfo.interval === 'year') return 'Yearly';
    if (billingInfo.interval === 'month') return 'Monthly';
    return currentPlan.type;
  })();
  const headerCtaLabel = (() => {
    if (currentPlan.name === 'Starter' || currentPlan.type === 'Free') return 'Upgrade Plan';
    if (billingInfo.interval === 'year') return 'Manage plan';
    return 'Switch to annual and save 20%';
  })();
  const handleUpgradeToYearly = async () => {
    try {
      // Map current plan to yearly price id
      const yearlyPriceIdMap = {
        pro: 'price_1SEBUCH2U2KQUmUhkym5Q9TS',
        business: 'price_1SEBUoH2U2KQUmUhMktbhCsm'
      };
      const planKey = currentPlan.name.toLowerCase();
      const priceId = planKey.includes('business') ? yearlyPriceIdMap.business : yearlyPriceIdMap.pro;
      const res = await fetch('/api/custom-projects-backend/billing/checkout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName: `${currentPlan.name} (Yearly)`, upgradeFromSubscriptionId: billingInfo.subscriptionId })
      });
      if (!res.ok) throw new Error('Failed to create upgrade session');
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert('Failed to start upgrade. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 w-full">
      <Sidebar currentTab={currentTab} onFolderSelect={setSelectedFolderId} selectedFolderId={selectedFolderId} folders={folders} folderProjects={folderProjects} />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-slate-900">{t('interface.billingAndSubscription', 'Billing and subscription')}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Current Plan Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {/* Current Plan Tag */}
                <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full mb-6">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Current plan</span>
                </div>

                {/* Plan Name */}
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{currentPlan.name}</h2>
                
                {/* Plan Type and Renewal Info */}
                <div className="flex items-center gap-2 mb-6">
                  <p className="text-lg text-gray-600">{displayType}</p>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-sm text-gray-500">Renews on November 16th, 2025.</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-8">
                  {billingInfo.interval === 'month' ? (
                    <button 
                      onClick={handleUpgradeToYearly}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 rounded-lg transition-colors"
                    >
                      {headerCtaLabel}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsTariffPlanModalOpen(true)}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 rounded-lg transition-colors"
                    >
                      {headerCtaLabel}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setIsTariffPlanModalOpen(true)}
                    className="w-full bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* What's Included Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    What's included
                  </h3>
                  <ul className="space-y-3">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Your Add-ons */}
              <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Your Add-ons
                  </h2>
                  <div className={`grid gap-4 ${purchasedItems.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {purchasedItems.map((item, index) => (
                      <div key={index} className="flex flex-col bg-blue-50 backdrop-blur-sm text-blue-700 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3 px-6 py-4">
                          {getIcon(item.type)}
                          <span className="font-medium text-base">{item.name}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setItemToCancel(item);
                            setIsCancelModalOpen(true);
                          }}
                          className="bg-red-50 border border-red-300 text-sm text-red-600 font-medium py-1 px-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 mx-4 my-2"
                        >
                          <X className="w-5 h-5" />
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Manage Subscription */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage subscription</h2>
                <p className="text-gray-600 mb-6">
                  You can get invoices, update your payment method, and adjust your subscription in Stripe
                </p>

                <button 
                  disabled={!billingInfo.subscriptionId || portalLoading}
                  onClick={async () => {
                    try {
                      setPortalLoading(true);
                      const res = await fetch('/api/custom-projects-backend/billing/portal', { method: 'POST', credentials: 'same-origin' });
                      if (!res.ok) throw new Error('Failed to create portal session');
                      const data = await res.json();
                      if (data?.url) window.location.href = data.url;
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setPortalLoading(false);
                    }
                  }}
                  className={`w-full bg-white border ${billingInfo.subscriptionId ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'} font-medium py-3 px-4 rounded-lg transition-colors mb-3 flex items-center justify-center gap-2`}
                >
                  {portalLoading ? 'Opening...' : 'Manage subscription in Stripe'}
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => {
                    setItemToCancel({ type: 'subscription', name: currentPlan.name, amount: 'Full subscription' });
                    setIsCancelModalOpen(true);
                  }}
                  className="w-full bg-white border border-red-300 text-red-600 font-medium py-3 px-4 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddOnsModal
        isOpen={isAddonsModalOpen}
        onClose={() => setIsAddonsModalOpen(false)}
      />

      <TariffPlanModal
        open={isTariffPlanModalOpen}
        onOpenChange={setIsTariffPlanModalOpen}
      />

      {/* Cancel Subscription Confirmation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCancelModalOpen(false);
          setItemToCancel(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              Cancel {itemToCancel?.type === 'subscription' ? 'Subscription' : 'Add-on'}
            </DialogTitle>
          </DialogHeader>
          
          {itemToCancel && (
            <>
              {/* Item Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {getIcon(itemToCancel.type)}
                  <span className="font-medium text-gray-900">{itemToCancel.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {itemToCancel.type === 'subscription' ? (
                    <>
                      <p>Current Plan: {currentPlan.name}</p>
                      <p>Price: {currentPlan.price}</p>
                    </>
                  ) : (
                    <>
                      <p>Amount: {itemToCancel.amount}</p>
                      <p>Price: ${itemToCancel.price}/month</p>
                      <p>Purchased: {itemToCancel.purchaseDate}</p>
                    </>
                  )}
                </div>
              </div>
              
              <DialogDescription>
                Are you sure you want to cancel this {itemToCancel.type === 'subscription' ? 'subscription' : 'add-on'}? This action will:
              </DialogDescription>
              
              <ul className="space-y-2 text-sm text-gray-600">
                {itemToCancel.type === 'subscription' ? (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      End your current plan immediately
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Remove access to premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      You can reactivate anytime
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Remove {itemToCancel.name} subscription from your account
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Stop billing for this add-on
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      You can re-add it anytime
                    </li>
                  </>
                )}
              </ul>
            </>
          )}
          
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelModalOpen(false);
                setItemToCancel(null);
              }}
              className="flex-1"
            >
              Keep {itemToCancel?.type === 'subscription' ? 'Subscription' : 'Add-on'}
            </Button>
            <Button
              variant="download"
              disabled={cancelLoading}
              onClick={async () => {
                if (itemToCancel?.type !== 'subscription') return;
                try {
                  setCancelLoading(true);
                  const res = await fetch('/api/custom-projects-backend/billing/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ subscriptionId: billingInfo.subscriptionId })
                  });
                  if (!res.ok) throw new Error('Cancel failed');
                  setIsCancelModalOpen(false);
                  setItemToCancel(null);
                  // Refresh billing info
                  const refreshed = await fetch('/api/custom-projects-backend/billing/me?refresh=1', { credentials: 'same-origin' });
                  if (refreshed.ok) setBillingInfo(await refreshed.json());
                } catch (e) {
                  console.error(e);
                } finally {
                  setCancelLoading(false);
                }
              }}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500"
            >
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
