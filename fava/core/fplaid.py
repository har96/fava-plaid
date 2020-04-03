import json
import plaid

PLAID_DATA = "plaid_config.json"


def get_plaid_data():
    """ Return the data in PLAID_DATA file
    as a dictionary"""
    with open(PLAID_DATA) as plaid_file:
        return json.load(plaid_file)


def update_institutions():
    """
    Update the institution names
    used by plaid
    """
    plaid_data = get_plaid_data()
    # Update institutions
    if plaid_data.get("items"):
        plaid_data["institutions"] = get_institutions()
    else:
        plaid_data["institutions"] = None

    # Save info
    write_plaid_data(plaid_data)

def create_client():
    """ Return a client object """
    data = get_plaid_data()
    client = plaid.Client(
        client_id=data["client_id"],
        secret=data["secret"],
        public_key=data["public_key"],
        environment=data["environment"],
        api_version='2019-05-29'
    )

    return client


def get_transactions(start_date, end_date, access_token):
    """return a list of transactions"""
    client = create_client()
    
    # get transactions
    response = client.Transactions.get(access_token=access_token,
                    start_date=start_date,
                    end_date=end_date)

    transactions = response["transactions"]

    while len(transactions) < response["total_transactions"]:
        response = client.Transactions.get(access_token=access_token,
                    start_date=start_date,
                    end_date=end_date)
        transactions.extend(response["transactions"])

    return transactions


def get_institutions():
    """ Return institution->access_token pairs """
    client = create_client()
    items = get_plaid_data()["items"]

    inst = {}
    for item_id, access_token in items.items():
        # Get institution id
        res = client.Item.get(access_token)
        inst_id = res["item"]["institution_id"]
        # Get institution name from id
        res = client.Institutions.get_by_id(inst_id)
        name = res["institution"]["name"]
        inst[name] = access_token

    return inst


def write_plaid_data(data):
    """ Save dictionary of data back to plaid file as
    json"""
    with open(PLAID_DATA, "w") as plaid_file:
        json.dump(data, plaid_file, sort_keys=True, indent=4)


def save_access_token(access_token, item_id):
    """ Save access token for item to config file"""
    init_data = get_plaid_data()

    # Save access token
    init_data["items"][item_id] = access_token

    write_plaid_data(init_data)

    # Update institutions
    update_institutions()


def get_access_token(item_id):
    """ Return access_token """
    return get_plaid_data()["items"].get(item_id)
