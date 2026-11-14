import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const today = () => new Date().toISOString().slice(0, 10);
const ACCOUNT_LABELS = { CHECKING: 'Courant', SAVINGS: 'Épargne' };

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('CHECKING');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(today());
  const [txCategoryId, setTxCategoryId] = useState('');

  useEffect(() => {
    loadAccounts();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedAccountId) loadTransactions(selectedAccountId);
  }, [selectedAccountId]);

  async function loadAccounts() {
    const res = await axiosClient.get('/accounts');
    setAccounts(res.data);
    if (res.data.length > 0 && !selectedAccountId) setSelectedAccountId(res.data[0].id);
  }

  async function loadCategories() {
    const res = await axiosClient.get('/categories');
    setCategories(res.data);
    if (res.data.length > 0) setTxCategoryId(res.data[0].id);
  }

  async function loadTransactions(accountId) {
    const res = await axiosClient.get(`/transactions/account/${accountId}`);
    setTransactions(res.data);
  }

  async function handleCreateAccount(e) {
    e.preventDefault();
    if (!newAccountName) return;
    setError('');
    try {
      const res = await axiosClient.post('/accounts', {
        name: newAccountName,
        type: newAccountType,
        initialBalance: newAccountBalance === '' ? 0 : parseFloat(newAccountBalance),
      });
      setNewAccountName('');
      setNewAccountBalance('');
      setShowAccountForm(false);
      await loadAccounts();
      setSelectedAccountId(res.data.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de créer le compte');
    }
  }

  async function handleCreateTransaction(e) {
    e.preventDefault();
    if (!txAmount || !txDate || !selectedAccountId) return;
    setError('');
    try {
      await axiosClient.post('/transactions', {
        accountId: selectedAccountId,
        categoryId: txCategoryId,
        amount: parseFloat(txAmount),
        description: txDescription,
        date: txDate,
      });
      setTxAmount('');
      setTxDescription('');
      setTxDate(today());
      loadTransactions(selectedAccountId);
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'ajouter la transaction");
    }
  }

  async function handleDeleteTransaction(id) {
    if (!window.confirm('Supprimer cette transaction ?')) return;
    setError('');
    try {
      await axiosClient.delete(`/transactions/${id}`);
      loadTransactions(selectedAccountId);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de supprimer la transaction');
    }
  }

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const initialBalance = parseFloat(selectedAccount?.initialBalance ?? 0);
  const sumOf = (type) =>
    transactions
      .filter((t) => t.category.type === type)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const income = sumOf('INCOME');
  const expense = sumOf('EXPENSE');
  const balance = initialBalance + income - expense;

  // Sans compte, le formulaire de création est affiché d'office
  const accountFormOpen = showAccountForm || accounts.length === 0;

  return (
    <>
      <header className="topbar">
        <span className="brand">FinTrack</span>
        <div className="topbar-user">
          <span>{user?.firstName}</span>
          <button className="btn-ghost btn-small" onClick={logout}>Se déconnecter</button>
        </div>
      </header>

      <main className="layout">
        <aside>
          <section className="panel">
            <h2 className="panel-title">Mes comptes</h2>
            {accounts.length > 0 && (
              <ul className="account-list">
                {accounts.map((acc) => (
                  <li key={acc.id}>
                    <button
                      type="button"
                      className="account-btn"
                      aria-current={acc.id === selectedAccountId}
                      onClick={() => setSelectedAccountId(acc.id)}
                    >
                      {acc.name}
                      <span className="account-kind">{ACCOUNT_LABELS[acc.type]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {accountFormOpen ? (
              <form onSubmit={handleCreateAccount} className="stack">
                <input
                  placeholder="Nom du compte"
                  aria-label="Nom du compte"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Solde initial (optionnel)"
                  aria-label="Solde initial"
                  value={newAccountBalance}
                  onChange={(e) => setNewAccountBalance(e.target.value)}
                />
                <select
                  aria-label="Type de compte"
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                >
                  <option value="CHECKING">Courant</option>
                  <option value="SAVINGS">Épargne</option>
                </select>
                <button type="submit" className="btn-primary">Créer le compte</button>
                {accounts.length > 0 && (
                  <button type="button" className="btn-ghost" onClick={() => setShowAccountForm(false)}>
                    Annuler
                  </button>
                )}
              </form>
            ) : (
              <button type="button" className="btn-ghost" onClick={() => setShowAccountForm(true)}>
                Nouveau compte
              </button>
            )}
          </section>
        </aside>

        <div>
          {error && <p className="auth-error" role="alert">{error}</p>}

          {selectedAccount ? (
            <>
              <section className="panel summary">
                <div>
                  <p className="summary-label">{selectedAccount.name} · solde actuel</p>
                  <p className={`summary-balance num ${balance < 0 ? 'negative' : ''}`}>{eur.format(balance)}</p>
                </div>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="summary-label">Solde initial</span>
                    <strong className="num">{eur.format(initialBalance)}</strong>
                  </div>
                  <div className="stat income">
                    <span className="summary-label">Revenus</span>
                    <strong className="num">{eur.format(income)}</strong>
                  </div>
                  <div className="stat expense">
                    <span className="summary-label">Dépenses</span>
                    <strong className="num">{eur.format(expense)}</strong>
                  </div>
                </div>
              </section>

              <section className="panel">
                <h2 className="panel-title">Nouvelle transaction</h2>
                <form onSubmit={handleCreateTransaction} className="tx-form">
                  <div>
                    <label htmlFor="tx-amount">Montant (€)</label>
                    <input id="tx-amount" type="number" step="0.01" min="0" placeholder="0,00"
                      value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="tx-desc">Description</label>
                    <input id="tx-desc" placeholder="Facultatif"
                      value={txDescription} onChange={(e) => setTxDescription(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="tx-date">Date</label>
                    <input id="tx-date" type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="tx-cat">Catégorie</label>
                    <select id="tx-cat" value={txCategoryId} onChange={(e) => setTxCategoryId(e.target.value)}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type === 'INCOME' ? 'revenu' : 'dépense'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary">Ajouter</button>
                </form>
              </section>

              <section className="panel">
                <h2 className="panel-title">Historique</h2>
                {transactions.length === 0 ? (
                  <p className="empty">Aucune transaction sur ce compte. Ajoutez la première ci-dessus.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Catégorie</th>
                          <th className="col-amount">Montant</th>
                          <th><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => {
                          const isIncome = t.category.type === 'INCOME';
                          return (
                            <tr key={t.id}>
                              <td className="num">{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                              <td>{t.description || '—'}</td>
                              <td><span className="badge">{t.category.name}</span></td>
                              <td className={`col-amount num ${isIncome ? 'income' : 'expense'}`}>
                                {isIncome ? '+' : '−'}{eur.format(parseFloat(t.amount))}
                              </td>
                              <td className="col-action">
                                <button type="button" className="btn-ghost btn-small"
                                  onClick={() => handleDeleteTransaction(t.id)}>
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="panel">
              <p className="empty">Créez votre premier compte à gauche pour commencer à suivre vos transactions.</p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
