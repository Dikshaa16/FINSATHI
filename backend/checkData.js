const { User, Transaction } = require('./models');

async function checkData() {
  try {
    const users = await User.findAll();
    const transactions = await Transaction.findAll({ limit: 10, order: [['createdAt', 'DESC']] });
    
    console.log('\n📊 DATABASE STATUS:\n');
    console.log(`Users: ${users.length}`);
    users.forEach(u => {
      console.log(`  - ${u.email} (ID: ${u.id})`);
    });
    
    console.log(`\nTransactions: ${transactions.length}`);
    if (transactions.length > 0) {
      console.log(`  First transaction belongs to user: ${transactions[0].userId}`);
      console.log('\n  Recent transactions:');
      transactions.slice(0, 5).forEach(t => {
        console.log(`    - ${t.merchant}: ₹${t.amount} (${t.type}, ${t.category})`);
      });
    }
    
    // Check if user IDs match
    if (users.length > 0 && transactions.length > 0) {
      const userIds = users.map(u => u.id);
      const txnUserId = transactions[0].userId;
      const match = userIds.includes(txnUserId);
      console.log(`\n✅ User ID Match: ${match ? 'YES' : 'NO'}`);
      if (!match) {
        console.log('❌ PROBLEM: Transactions belong to different user!');
        console.log(`   Transaction user: ${txnUserId}`);
        console.log(`   Available users: ${userIds.join(', ')}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();
