import json
import plaid

PLAID_DATA = "plaid_config.json"


def get_plaid_data():
    """ Return the data in PLAID_DATA file
    as a dictionary"""
    with open(PLAID_DATA) as plaid_file:
        return json.load(plaid_file)


def create_client():
    """ Return a client object """
    data = get_plaid_data()
    print("plaid data:")
    print(data)
    client = plaid.Client(
        client_id=data["client_id"],
        secret=data["secret"],
        public_key=data["public_key"],
        environment=data["environment"],
        api_version='2019-05-29'
    )

    return client


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


def get_access_token(item_id):
    """ Return access_token """
    return get_plaid_data()["items"].get(item_id)
